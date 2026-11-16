import { createHash, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'

export const MUSIC_SESSION_COOKIE = 'fgs_music_session'

export function createMusicSessionToken() {
  return randomBytes(32).toString('base64url')
}

export function hashMusicSession(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function getMusicSessionHash() {
  const token = (await cookies()).get(MUSIC_SESSION_COOKIE)?.value
  return token ? hashMusicSession(token) : null
}
