import { and, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { musicPlays, musicTracks } from '@/lib/db/schema'
import { createMusicSessionToken, hashMusicSession, MUSIC_SESSION_COOKIE } from '@/lib/music-session'

export const runtime = 'nodejs'

export async function POST(request: Request, { params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await params
  if (!/^[0-9a-f-]{36}$/i.test(trackId)) return NextResponse.json({ recorded: false }, { status: 404 })
  const [track] = await db.select({ id: musicTracks.id }).from(musicTracks).where(and(eq(musicTracks.id, trackId), eq(musicTracks.isPublished, true))).limit(1)
  if (!track) return NextResponse.json({ recorded: false }, { status: 404 })

  const cookieStore = await cookies()
  const existingToken = cookieStore.get(MUSIC_SESSION_COOKIE)?.value
  const sessionToken = existingToken || createMusicSessionToken()
  const [inserted] = await db.insert(musicPlays).values({ trackId: track.id, listenerHash: hashMusicSession(sessionToken) }).onConflictDoNothing().returning({ id: musicPlays.id })
  const response = NextResponse.json({ recorded: Boolean(inserted) })
  if (!existingToken) {
    const secure = new URL(request.url).protocol === 'https:'
    response.cookies.set(MUSIC_SESSION_COOKIE, sessionToken, { httpOnly: true, secure, sameSite: secure ? 'none' : 'lax', path: '/', maxAge: 60 * 60 * 24 * 365 })
  }
  return response
}
