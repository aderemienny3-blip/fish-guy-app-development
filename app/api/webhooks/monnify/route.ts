import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { confirmMusicOrder } from '@/lib/monnify'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const secret = process.env.MONNIFY_SECRET_KEY
  const signature = request.headers.get('monnify-signature')
  if (!secret || !signature) return NextResponse.json({ error: 'Invalid payment notification.' }, { status: 401 })

  const rawBody = await request.text()
  const expected = createHmac('sha512', secret).update(rawBody).digest('hex')
  const actualBuffer = Buffer.from(signature, 'utf8')
  const expectedBuffer = Buffer.from(expected, 'utf8')
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return NextResponse.json({ error: 'Invalid payment notification.' }, { status: 401 })
  }

  let payload: { eventData?: { paymentReference?: string } }
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid payment notification.' }, { status: 400 })
  }
  const reference = payload.eventData?.paymentReference
  if (!reference || !/^FGS-[A-F0-9]{32}$/.test(reference)) return NextResponse.json({ received: true })

  try {
    await confirmMusicOrder(reference)
    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ error: 'Payment verification could not complete.' }, { status: 503 })
  }
}
