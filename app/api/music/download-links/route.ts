import { randomBytes } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { musicArtists, musicDownloadLinks, musicOrderItems, musicOrders, musicTracks } from '@/lib/db/schema'
import { getMusicSessionHash, hashMusicSession } from '@/lib/music-session'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const sessionHash = await getMusicSessionHash()
  if (!sessionHash) return NextResponse.json({ error: 'Open the library in the browser used to complete checkout.' }, { status: 401 })
  const body = await request.json().catch(() => null)
  const orderItemId = typeof body?.orderItemId === 'string' ? body.orderItemId : ''
  const format = body?.format === 'wav' ? 'wav' : body?.format === 'mp3' ? 'mp3' : null
  if (!/^[0-9a-f-]{36}$/i.test(orderItemId) || !format) return NextResponse.json({ error: 'Choose a valid purchased track and format.' }, { status: 400 })

  const [purchase] = await db
    .select({ itemId: musicOrderItems.id, audioPath: format === 'wav' ? musicTracks.wavBlobPath : musicTracks.mp3BlobPath })
    .from(musicOrderItems)
    .innerJoin(musicOrders, eq(musicOrderItems.orderId, musicOrders.id))
    .innerJoin(musicTracks, eq(musicOrderItems.trackId, musicTracks.id))
    .innerJoin(musicArtists, eq(musicTracks.artistId, musicArtists.id))
    .where(and(eq(musicOrderItems.id, orderItemId), eq(musicOrders.buyerSessionHash, sessionHash), eq(musicOrders.status, 'paid')))
    .limit(1)
  if (!purchase || !purchase.audioPath) return NextResponse.json({ error: 'That format is not available for this purchase.' }, { status: 404 })

  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
  await db.insert(musicDownloadLinks).values({ orderItemId: purchase.itemId, tokenHash: hashMusicSession(token), format, expiresAt })
  return NextResponse.json({ url: `/api/music/downloads/${token}`, expiresAt: expiresAt.toISOString() }, { status: 201 })
}
