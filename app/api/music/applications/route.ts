import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { musicArtistApplications } from '@/lib/db/schema'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Please check the application details.' }, { status: 400 })

  const artistName = typeof body.artistName === 'string' ? body.artistName.trim() : ''
  const contactName = typeof body.contactName === 'string' ? body.contactName.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const links = typeof body.links === 'string' ? body.links.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!artistName || artistName.length > 120 || !contactName || contactName.length > 120 || !emailPattern.test(email) || email.length > 254 || !links || links.length > 1500 || message.length > 1200) {
    return NextResponse.json({ error: 'Enter an artist name, contact name, valid email, and music links.' }, { status: 400 })
  }

  await db.insert(musicArtistApplications).values({ artistName, contactName, email, links, message: message || null })
  return NextResponse.json({ submitted: true }, { status: 201 })
}
