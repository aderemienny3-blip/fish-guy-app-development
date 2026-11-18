import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { advertisingBookings } from '@/lib/db/schema'

export const runtime = 'nodejs'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^[+()\d\s.-]{7,40}$/
const budgetPattern = /^\d+(?:\.\d{1,2})?$/

function isDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export async function POST(request: Request) {
  const rawBody = await request.json().catch(() => null)
  if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
    return NextResponse.json({ error: 'Please check the campaign details.' }, { status: 400 })
  }

  const body = rawBody as Record<string, unknown>
  const honeypot = typeof body.website === 'string' ? body.website.trim() : ''
  if (honeypot) return NextResponse.json({ submitted: true }, { status: 201 })

  const artistName = typeof body.artistName === 'string' ? body.artistName.trim() : ''
  const contactName = typeof body.contactName === 'string' ? body.contactName.trim() : ''
  const contactEmail = typeof body.contactEmail === 'string' ? body.contactEmail.trim().toLowerCase() : ''
  const contactPhone = typeof body.contactPhone === 'string' ? body.contactPhone.trim() : ''
  const placement = body.placement
  const campaignTitle = typeof body.campaignTitle === 'string' ? body.campaignTitle.trim() : ''
  const startsOn = typeof body.startsOn === 'string' ? body.startsOn : ''
  const endsOn = typeof body.endsOn === 'string' ? body.endsOn : ''
  const budgetNaira = typeof body.budgetNaira === 'string' ? body.budgetNaira.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  const budgetKobo = budgetPattern.test(budgetNaira) ? Math.round(Number(budgetNaira) * 100) : 0
  const today = new Date().toISOString().slice(0, 10)

  if (
    !artistName || artistName.length > 120 ||
    !contactName || contactName.length > 120 ||
    !emailPattern.test(contactEmail) || contactEmail.length > 254 ||
    (contactPhone && !phonePattern.test(contactPhone)) ||
    (placement !== 'home_featured' && placement !== 'sounds_featured') ||
    !campaignTitle || campaignTitle.length > 160 ||
    !isDateOnly(startsOn) || startsOn < today ||
    !isDateOnly(endsOn) || endsOn < startsOn ||
    !Number.isSafeInteger(budgetKobo) || budgetKobo <= 0 || budgetKobo > 2_147_483_647 ||
    message.length > 1200
  ) {
    return NextResponse.json({ error: 'Enter valid contact details, placement, future campaign dates, and a positive budget.' }, { status: 400 })
  }

  await db.insert(advertisingBookings).values({
    artistName,
    contactName,
    contactEmail,
    contactPhone: contactPhone || null,
    placement,
    campaignTitle,
    startsOn,
    endsOn,
    budgetKobo,
    message: message || null,
  })

  return NextResponse.json({ submitted: true }, { status: 201 })
}
