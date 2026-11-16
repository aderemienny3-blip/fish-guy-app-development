import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { musicOrders } from '@/lib/db/schema'

const MONNIFY_ORIGIN = (process.env.MONNIFY_BASE_URL || 'https://api.monnify.com').replace(/\/+$/, '')

type MonnifyEnvelope<T> = { requestSuccessful?: boolean; responseBody?: T; responseMessage?: string }

type InitResponse = { checkoutUrl?: string; transactionReference?: string }
type StatusResponse = {
  paymentReference?: string
  paymentStatus?: string
  amountPaid?: number | string
  currencyCode?: string
}

function getMonnifyCredentials() {
  const apiKey = process.env.MONNIFY_API_KEY
  const secretKey = process.env.MONNIFY_SECRET_KEY
  const contractCode = process.env.MONNIFY_CONTRACT_CODE
  if (!apiKey || !secretKey || !contractCode) {
    throw new Error('Monnify is not configured. Add MONNIFY_API_KEY, MONNIFY_SECRET_KEY, and MONNIFY_CONTRACT_CODE to the project environment.')
  }
  return { apiKey, secretKey, contractCode }
}

async function getAccessToken() {
  const { apiKey, secretKey } = getMonnifyCredentials()
  const response = await fetch(`${MONNIFY_ORIGIN}/api/v1/auth/login`, {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${apiKey}:${secretKey}`).toString('base64')}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  })
  const payload = await response.json() as MonnifyEnvelope<{ accessToken?: string }>
  if (!response.ok || payload.requestSuccessful === false || !payload.responseBody?.accessToken) {
    throw new Error('Monnify could not authorize this checkout.')
  }
  return payload.responseBody.accessToken
}

export async function initializeMonnifyTransaction(input: {
  amountKobo: number
  buyerName: string
  buyerEmail: string
  paymentReference: string
  description: string
  redirectUrl: string
}) {
  const { contractCode } = getMonnifyCredentials()
  const accessToken = await getAccessToken()
  const response = await fetch(`${MONNIFY_ORIGIN}/api/v1/merchant/transactions/init-transaction`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: input.amountKobo / 100,
      customerName: input.buyerName,
      customerEmail: input.buyerEmail,
      paymentReference: input.paymentReference,
      paymentDescription: input.description,
      currencyCode: 'NGN',
      contractCode,
      redirectUrl: input.redirectUrl,
      paymentMethods: ['CARD', 'ACCOUNT_TRANSFER', 'USSD'],
    }),
    cache: 'no-store',
  })
  const payload = await response.json() as MonnifyEnvelope<InitResponse>
  const checkoutUrl = payload.responseBody?.checkoutUrl
  const transactionReference = payload.responseBody?.transactionReference
  if (!response.ok || payload.requestSuccessful === false || !checkoutUrl || !transactionReference) {
    throw new Error('Monnify could not initialize the payment.')
  }
  const checkout = new URL(checkoutUrl)
  if (checkout.protocol !== 'https:' || !checkout.hostname.endsWith('monnify.com')) {
    throw new Error('Monnify returned an unexpected checkout destination.')
  }
  return { checkoutUrl: checkout.toString(), transactionReference }
}

async function getTransactionStatus(transactionReference: string) {
  const accessToken = await getAccessToken()
  const response = await fetch(`${MONNIFY_ORIGIN}/api/v2/transactions/${encodeURIComponent(transactionReference)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  const payload = await response.json() as MonnifyEnvelope<StatusResponse>
  if (!response.ok || payload.requestSuccessful === false || !payload.responseBody) {
    throw new Error('Monnify payment status could not be verified.')
  }
  return payload.responseBody
}

export async function confirmMusicOrder(paymentReference: string) {
  const [order] = await db.select().from(musicOrders).where(eq(musicOrders.monnifyReference, paymentReference)).limit(1)
  if (!order) return false
  if (order.status === 'paid') return true
  if (!order.monnifyTransactionReference) return false

  const transaction = await getTransactionStatus(order.monnifyTransactionReference)
  const amountPaidKobo = Math.round(Number(transaction.amountPaid) * 100)
  if (transaction.paymentStatus !== 'PAID' || transaction.paymentReference !== order.monnifyReference || transaction.currencyCode !== 'NGN' || amountPaidKobo !== order.amountKobo) {
    return false
  }

  await db.update(musicOrders).set({ status: 'paid', paidAt: new Date() }).where(and(eq(musicOrders.id, order.id), eq(musicOrders.status, 'pending')))
  const [confirmed] = await db.select({ status: musicOrders.status }).from(musicOrders).where(eq(musicOrders.id, order.id)).limit(1)
  return confirmed?.status === 'paid'
}

export async function confirmMusicOrderForSession(paymentReference: string, sessionHash: string) {
  const [order] = await db.select({ sessionHash: musicOrders.buyerSessionHash }).from(musicOrders).where(eq(musicOrders.monnifyReference, paymentReference)).limit(1)
  if (!order || order.sessionHash !== sessionHash) return false
  return confirmMusicOrder(paymentReference)
}
