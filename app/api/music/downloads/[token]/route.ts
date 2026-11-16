import { and, eq, gt } from 'drizzle-orm'
import { get } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { musicArtists, musicDownloadLinks, musicOrderItems, musicOrders, musicTracks } from '@/lib/db/schema'
import { getMusicSessionHash, hashMusicSession } from '@/lib/music-session'

export const runtime = 'nodejs'

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const sessionHash = await getMusicSessionHash()
  if (!sessionHash || !/^[A-Za-z0-9_-]{40,50}$/.test(token)) return NextResponse.json({ error: 'Download link is invalid or expired.' }, { status: 404 })

  const [file] = await db
    .select({ title: musicTracks.title, format: musicDownloadLinks.format, mp3Path: musicTracks.mp3BlobPath, wavPath: musicTracks.wavBlobPath })
    .from(musicDownloadLinks)
    .innerJoin(musicOrderItems, eq(musicDownloadLinks.orderItemId, musicOrderItems.id))
    .innerJoin(musicOrders, eq(musicOrderItems.orderId, musicOrders.id))
    .innerJoin(musicTracks, eq(musicOrderItems.trackId, musicTracks.id))
    .innerJoin(musicArtists, eq(musicTracks.artistId, musicArtists.id))
    .where(and(eq(musicDownloadLinks.tokenHash, hashMusicSession(token)), gt(musicDownloadLinks.expiresAt, new Date()), eq(musicOrders.buyerSessionHash, sessionHash), eq(musicOrders.status, 'paid')))
    .limit(1)
  const pathname = file?.format === 'wav' ? file.wavPath : file?.mp3Path
  if (!file || !pathname) return NextResponse.json({ error: 'Download link is invalid or expired.' }, { status: 404 })

  try {
    const blob = await get(pathname, { access: 'private' })
    if (!blob) return NextResponse.json({ error: 'The audio file is no longer available.' }, { status: 404 })
    const safeTitle = file.title.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '').slice(0, 100) || 'fish-guy-track'
    const extension = file.format === 'wav' ? 'wav' : 'mp3'
    return new NextResponse(blob.stream, {
      headers: {
        'Content-Type': blob.blob.contentType || (extension === 'wav' ? 'audio/wav' : 'audio/mpeg'),
        'Content-Disposition': `attachment; filename="${safeTitle}.${extension}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return NextResponse.json({ error: 'The audio file is temporarily unavailable.' }, { status: 503 })
  }
}
