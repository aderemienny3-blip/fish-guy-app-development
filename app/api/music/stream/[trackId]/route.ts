import { and, eq } from 'drizzle-orm'
import { get } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { musicArtists, musicOrderItems, musicOrders, musicTracks } from '@/lib/db/schema'
import { getMusicSessionHash } from '@/lib/music-session'

export const runtime = 'nodejs'

export async function GET(request: Request, { params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await params
  if (!/^[0-9a-f-]{36}$/i.test(trackId)) return NextResponse.json({ error: 'Track not found.' }, { status: 404 })

  const [track] = await db
    .select({ id: musicTracks.id, previewPath: musicTracks.previewBlobPath, fullPath: musicTracks.mp3BlobPath, isFree: musicTracks.isFreeToStream })
    .from(musicTracks)
    .innerJoin(musicArtists, eq(musicTracks.artistId, musicArtists.id))
    .where(and(eq(musicTracks.id, trackId), eq(musicTracks.isPublished, true)))
    .limit(1)
  if (!track) return NextResponse.json({ error: 'Track not found.' }, { status: 404 })

  const sessionHash = await getMusicSessionHash()
  let hasPurchased = false
  if (sessionHash) {
    const [entitlement] = await db
      .select({ id: musicOrderItems.id })
      .from(musicOrderItems)
      .innerJoin(musicOrders, eq(musicOrderItems.orderId, musicOrders.id))
      .where(and(eq(musicOrderItems.trackId, track.id), eq(musicOrders.buyerSessionHash, sessionHash), eq(musicOrders.status, 'paid')))
      .limit(1)
    hasPurchased = Boolean(entitlement)
  }

  const fullAccess = track.isFree || hasPurchased
  const pathname = fullAccess ? track.fullPath : track.previewPath
  if (!pathname) return NextResponse.json({ error: 'Audio is not available.' }, { status: 404 })

  try {
    const result = await get(pathname, { access: 'private', ifNoneMatch: request.headers.get('if-none-match') ?? undefined })
    if (!result) return NextResponse.json({ error: 'Audio is not available.' }, { status: 404 })
    if (result.statusCode === 304) return new NextResponse(null, { status: 304, headers: { ETag: result.blob.etag, 'Cache-Control': 'private, no-store' } })
    return new NextResponse(result.stream, {
      headers: {
        'Content-Type': result.blob.contentType || 'audio/mpeg',
        ETag: result.blob.etag,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Audio is temporarily unavailable.' }, { status: 503 })
  }
}
