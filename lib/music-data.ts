import { and, count, desc, eq, gte } from 'drizzle-orm'
import { db } from '@/lib/db'
import { musicArtists, musicOrderItems, musicOrders, musicPlays, musicTracks } from '@/lib/db/schema'

export type MusicTrack = {
  id: string
  slug: string
  title: string
  genre: string
  mood: string | null
  coverImageUrl: string | null
  priceKobo: number
  durationSeconds: number
  isFreeToStream: boolean
  canPlay: boolean
  artistName: string
  artistSlug: string
  artistImageUrl: string | null
  playCount: number
}

export type MusicArtist = {
  id: string
  slug: string
  name: string
  bio: string | null
  imageUrl: string | null
  bannerUrl: string | null
  isFeatured: boolean
}

const trackSelection = {
  id: musicTracks.id,
  slug: musicTracks.slug,
  title: musicTracks.title,
  genre: musicTracks.genre,
  mood: musicTracks.mood,
  coverImageUrl: musicTracks.coverImageUrl,
  previewBlobPath: musicTracks.previewBlobPath,
  mp3BlobPath: musicTracks.mp3BlobPath,
  priceKobo: musicTracks.priceKobo,
  durationSeconds: musicTracks.durationSeconds,
  isFreeToStream: musicTracks.isFreeToStream,
  artistName: musicArtists.name,
  artistSlug: musicArtists.slug,
  artistImageUrl: musicArtists.imageUrl,
}

type TrackQueryRow = {
  id: string
  slug: string
  title: string
  genre: string
  mood: string | null
  coverImageUrl: string | null
  previewBlobPath: string | null
  mp3BlobPath: string | null
  priceKobo: number
  durationSeconds: number
  isFreeToStream: boolean
  artistName: string
  artistSlug: string
  artistImageUrl: string | null
}

function toTrackView(row: TrackQueryRow, playCount = 0): MusicTrack {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    genre: row.genre,
    mood: row.mood,
    coverImageUrl: row.coverImageUrl,
    priceKobo: row.priceKobo,
    durationSeconds: row.durationSeconds,
    isFreeToStream: row.isFreeToStream,
    canPlay: row.isFreeToStream ? Boolean(row.mp3BlobPath) : Boolean(row.previewBlobPath),
    artistName: row.artistName,
    artistSlug: row.artistSlug,
    artistImageUrl: row.artistImageUrl,
    playCount,
  }
}

export async function getSoundsPageData(genre?: string) {
  const [rows, featuredRows, playRows] = await Promise.all([
    db
      .select(trackSelection)
      .from(musicTracks)
      .innerJoin(musicArtists, eq(musicTracks.artistId, musicArtists.id))
      .where(eq(musicTracks.isPublished, true))
      .orderBy(desc(musicTracks.releasedAt), desc(musicTracks.createdAt)),
    db.select().from(musicArtists).where(eq(musicArtists.isFeatured, true)).orderBy(desc(musicArtists.createdAt)).limit(1),
    db
      .select({ trackId: musicPlays.trackId, total: count() })
      .from(musicPlays)
      .where(gte(musicPlays.playedAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)))
      .groupBy(musicPlays.trackId),
  ])

  const playCounts = new Map(playRows.map((row) => [row.trackId, Number(row.total)]))
  const allTracks = rows.map((row) => toTrackView(row, playCounts.get(row.id) ?? 0))
  const filteredTracks = genre
    ? allTracks.filter((track) => track.genre.toLowerCase() === genre.toLowerCase())
    : allTracks

  return {
    featuredArtist: (featuredRows[0] as MusicArtist | undefined) ?? null,
    tracks: filteredTracks,
    newReleases: filteredTracks.slice(0, 8),
    trending: [...filteredTracks].filter((track) => track.playCount > 0).sort((a, b) => b.playCount - a.playCount).slice(0, 8),
    hasPublishedTracks: allTracks.length > 0,
  }
}

export async function getTrackBySlug(slug: string) {
  const [row] = await db
    .select(trackSelection)
    .from(musicTracks)
    .innerJoin(musicArtists, eq(musicTracks.artistId, musicArtists.id))
    .where(and(eq(musicTracks.slug, slug), eq(musicTracks.isPublished, true)))
    .limit(1)

  return row ? toTrackView(row) : null
}

export async function getArtistBySlug(slug: string) {
  const [artist] = await db.select().from(musicArtists).where(eq(musicArtists.slug, slug)).limit(1)
  if (!artist) return null

  const rows = await db
    .select(trackSelection)
    .from(musicTracks)
    .innerJoin(musicArtists, eq(musicTracks.artistId, musicArtists.id))
    .where(and(eq(musicTracks.artistId, artist.id), eq(musicTracks.isPublished, true)))
    .orderBy(desc(musicTracks.releasedAt), desc(musicTracks.createdAt))

  return { artist: artist as MusicArtist, tracks: rows.map((row) => toTrackView(row)) }
}

export async function getLibraryItems(sessionHash: string) {
  return db
    .select({
      orderItemId: musicOrderItems.id,
      title: musicTracks.title,
      slug: musicTracks.slug,
      artistName: musicArtists.name,
      coverImageUrl: musicTracks.coverImageUrl,
      priceKobo: musicOrderItems.unitPriceKobo,
      purchasedAt: musicOrders.paidAt,
      hasMp3: musicTracks.mp3BlobPath,
      hasWav: musicTracks.wavBlobPath,
    })
    .from(musicOrderItems)
    .innerJoin(musicOrders, eq(musicOrderItems.orderId, musicOrders.id))
    .innerJoin(musicTracks, eq(musicOrderItems.trackId, musicTracks.id))
    .innerJoin(musicArtists, eq(musicTracks.artistId, musicArtists.id))
    .where(and(eq(musicOrders.buyerSessionHash, sessionHash), eq(musicOrders.status, 'paid')))
    .orderBy(desc(musicOrders.paidAt))
}
