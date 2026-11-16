import { and, eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { musicArtists, musicOrderItems, musicOrders, musicTracks } from '@/lib/db/schema'
import { createMusicSessionToken, hashMusicSession, MUSIC_SESSION_COOKIE } from '@/lib/music-session'
import { initializeMonnifyTransaction } from '@/lib/monnify'

export const runtime = 'nodejs'

function checkoutResponse(checkoutUrl: string, sessionToken: string, request: Request) {
  const response = NextResponse.json({ checkoutUrl })
  const secure = new URL(request.url).protocol === 'https:'
  response.cookies.set(MUSIC_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
  return response
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const trackId = typeof body?.trackId === 'string' ? body.trackId : ''
  const buyerName = typeof body?.buyerName === 'string' ? body.buyerName.trim() : ''
  const buyerEmail = typeof body?.buyerEmail === 'string' ? body.buyerEmail.trim().toLowerCase() : ''
  const idempotencyKey = typeof body?.idempotencyKey === 'string' ? body.idempotencyKey : ''
  if (!/^[0-9a-f-]{36}$/i.test(trackId) || !/^[0-9a-f-]{36}$/i.test(idempotencyKey) || !buyerName || buyerName.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail) || buyerEmail.length > 254) {
    return NextResponse.json({ error: 'Enter a valid name and email to continue.' }, { status: 400 })
  }

  const [track] = await db
    .select({ id: musicTracks.id, title: musicTracks.title, priceKobo: musicTracks.priceKobo })
    .from(musicTracks)
    .innerJoin(musicArtists, eq(musicTracks.artistId, musicArtists.id))
    .where(and(eq(musicTracks.id, trackId), eq(musicTracks.isPublished, true)))
    .limit(1)
  if (!track || track.priceKobo <= 0) return NextResponse.json({ error: 'This release is not available for purchase.' }, { status: 404 })

  const cookieStore = await cookies()
  const existingToken = cookieStore.get(MUSIC_SESSION_COOKIE)?.value
  const sessionToken = existingToken || createMusicSessionToken()
  const sessionHash = hashMusicSession(sessionToken)
  const paymentReference = `FGS-${randomUUID().replaceAll('-', '').toUpperCase()}`
  const createdOrder = await db.transaction(async (tx) => {
    const [order] = await tx.insert(musicOrders).values({
      buyerSessionHash: sessionHash,
      buyerEmail,
      buyerName,
      monnifyReference: paymentReference,
      amountKobo: track.priceKobo,
      status: 'pending',
      idempotencyKey,
    }).onConflictDoNothing({ target: musicOrders.idempotencyKey }).returning({
      id: musicOrders.id,
      monnifyReference: musicOrders.monnifyReference,
      amountKobo: musicOrders.amountKobo,
      buyerName: musicOrders.buyerName,
      buyerEmail: musicOrders.buyerEmail,
      status: musicOrders.status,
      monnifyTransactionReference: musicOrders.monnifyTransactionReference,
      monnifyCheckoutUrl: musicOrders.monnifyCheckoutUrl,
    })
    if (!order) return null
    await tx.insert(musicOrderItems).values({ orderId: order.id, trackId: track.id, unitPriceKobo: track.priceKobo })
    return order
  })

  let order = createdOrder
  if (!order) {
    const [existing] = await db
      .select({
        id: musicOrders.id,
        monnifyReference: musicOrders.monnifyReference,
        amountKobo: musicOrders.amountKobo,
        buyerName: musicOrders.buyerName,
        buyerEmail: musicOrders.buyerEmail,
        status: musicOrders.status,
        monnifyTransactionReference: musicOrders.monnifyTransactionReference,
        monnifyCheckoutUrl: musicOrders.monnifyCheckoutUrl,
        buyerSessionHash: musicOrders.buyerSessionHash,
        trackId: musicOrderItems.trackId,
      })
      .from(musicOrders)
      .innerJoin(musicOrderItems, eq(musicOrderItems.orderId, musicOrders.id))
      .where(eq(musicOrders.idempotencyKey, idempotencyKey))
      .limit(1)
    if (!existing || existing.buyerSessionHash !== sessionHash || existing.trackId !== track.id || existing.buyerEmail !== buyerEmail || existing.buyerName !== buyerName) {
      return NextResponse.json({ error: 'This checkout request cannot be reused.' }, { status: 409 })
    }
    if (existing.status === 'paid') {
      const returnUrl = `/sounds/return?paymentReference=${encodeURIComponent(existing.monnifyReference)}`
      return checkoutResponse(returnUrl, sessionToken, request)
    }
    if (existing.status !== 'pending') return NextResponse.json({ error: 'Start a new checkout attempt.', retryWithNewKey: true }, { status: 409 })
    if (existing.monnifyCheckoutUrl) return checkoutResponse(existing.monnifyCheckoutUrl, sessionToken, request)
    order = existing
  }

  try {
    const origin = new URL(request.url).origin
    const returnUrl = new URL(`/sounds/return?paymentReference=${encodeURIComponent(order.monnifyReference)}`, origin).toString()
    const payment = await initializeMonnifyTransaction({
      amountKobo: order.amountKobo,
      buyerName: order.buyerName,
      buyerEmail: order.buyerEmail,
      paymentReference: order.monnifyReference,
      description: `FISH GUY SOUNDS — ${track.title}`,
      redirectUrl: returnUrl,
    })
    await db.update(musicOrders).set({
      monnifyTransactionReference: payment.transactionReference,
      monnifyCheckoutUrl: payment.checkoutUrl,
    }).where(eq(musicOrders.id, order.id))
    return checkoutResponse(payment.checkoutUrl, sessionToken, request)
  } catch (error) {
    const message = error instanceof Error && error.message.startsWith('Monnify is not configured.')
      ? error.message
      : 'Secure checkout is temporarily unavailable. Please try again.'
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
