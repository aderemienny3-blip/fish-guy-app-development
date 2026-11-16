import { NextResponse } from 'next/server'
import { getMusicSessionHash } from '@/lib/music-session'
import { confirmMusicOrderForSession } from '@/lib/monnify'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const paymentReference = typeof body?.paymentReference === 'string' ? body.paymentReference : ''
  const sessionHash = await getMusicSessionHash()
  if (!sessionHash || !/^FGS-[A-F0-9]{32}$/.test(paymentReference)) {
    return NextResponse.json({ error: 'Payment could not be confirmed for this browser session.' }, { status: 403 })
  }

  try {
    const paid = await confirmMusicOrderForSession(paymentReference, sessionHash)
    return NextResponse.json({ paid })
  } catch {
    return NextResponse.json({ error: 'Payment status is temporarily unavailable. Try again shortly.' }, { status: 503 })
  }
}
