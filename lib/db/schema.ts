import { sql } from 'drizzle-orm'
import { boolean, check, date, index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

export const musicArtists = pgTable('music_artists', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  bio: text('bio'),
  imageUrl: text('image_url'),
  bannerUrl: text('banner_url'),
  isFeatured: boolean('is_featured').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const musicTracks = pgTable('music_tracks', {
  id: uuid('id').defaultRandom().primaryKey(),
  artistId: uuid('artist_id').notNull(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  genre: text('genre').notNull(),
  mood: text('mood'),
  coverImageUrl: text('cover_image_url'),
  previewBlobPath: text('preview_blob_path'),
  mp3BlobPath: text('mp3_blob_path'),
  wavBlobPath: text('wav_blob_path'),
  priceKobo: integer('price_kobo').notNull().default(0),
  durationSeconds: integer('duration_seconds').notNull(),
  isFreeToStream: boolean('is_free_to_stream').notNull().default(false),
  isPublished: boolean('is_published').notNull().default(false),
  releasedAt: timestamp('released_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const musicPlays = pgTable('music_plays', {
  id: uuid('id').defaultRandom().primaryKey(),
  trackId: uuid('track_id').notNull(),
  listenerHash: text('listener_hash').notNull().default(''),
  playDay: date('play_day', { mode: 'string' }).notNull().defaultNow(),
  playedAt: timestamp('played_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex('music_plays_track_listener_day_uidx').on(table.trackId, table.listenerHash, table.playDay)])

export const musicOrders = pgTable('music_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  buyerSessionHash: text('buyer_session_hash').notNull(),
  buyerEmail: text('buyer_email').notNull(),
  buyerName: text('buyer_name').notNull().default(''),
  monnifyReference: text('monnify_reference').notNull().unique(),
  monnifyTransactionReference: text('monnify_transaction_reference'),
  monnifyCheckoutUrl: text('monnify_checkout_url'),
  idempotencyKey: text('idempotency_key'),
  amountKobo: integer('amount_kobo').notNull(),
  status: text('status').notNull().default('pending'),
  foodOrderId: text('food_order_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp('paid_at', { withTimezone: true }),
}, (table) => [uniqueIndex('music_orders_idempotency_key_uidx').on(table.idempotencyKey)])

export const musicOrderItems = pgTable('music_order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull(),
  trackId: uuid('track_id').notNull(),
  unitPriceKobo: integer('unit_price_kobo').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const musicDownloadLinks = pgTable('music_download_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderItemId: uuid('order_item_id').notNull(),
  tokenHash: text('token_hash').notNull().unique(),
  format: text('format').notNull().default('mp3'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const musicArtistApplications = pgTable('music_artist_applications', {
  id: uuid('id').defaultRandom().primaryKey(),
  artistName: text('artist_name').notNull(),
  contactName: text('contact_name').notNull(),
  email: text('email').notNull(),
  links: text('links').notNull(),
  message: text('message'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const deliveryAreas = pgTable('delivery_areas', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  deliveryFeeKobo: integer('delivery_fee_kobo').notNull().default(0),
  freeDeliveryThresholdKobo: integer('free_delivery_threshold_kobo'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check('delivery_areas_delivery_fee_kobo_check', sql`${table.deliveryFeeKobo} >= 0`),
  check('delivery_areas_free_delivery_threshold_kobo_check', sql`${table.freeDeliveryThresholdKobo} IS NULL OR ${table.freeDeliveryThresholdKobo} >= 0`),
])

export const advertisingBookings = pgTable('advertising_bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  artistId: uuid('artist_id'),
  artistName: text('artist_name').notNull(),
  contactName: text('contact_name').notNull(),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone'),
  placement: text('placement', { enum: ['home_featured', 'sounds_featured'] }).notNull(),
  campaignTitle: text('campaign_title').notNull(),
  startsOn: date('starts_on', { mode: 'string' }).notNull(),
  endsOn: date('ends_on', { mode: 'string' }).notNull(),
  budgetKobo: integer('budget_kobo').notNull(),
  status: text('status', { enum: ['pending', 'approved', 'rejected', 'active', 'completed', 'cancelled'] }).notNull().default('pending'),
  message: text('message'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check('advertising_bookings_placement_check', sql`${table.placement} IN ('home_featured', 'sounds_featured')`),
  check('advertising_bookings_status_check', sql`${table.status} IN ('pending', 'approved', 'rejected', 'active', 'completed', 'cancelled')`),
  check('advertising_bookings_budget_kobo_check', sql`${table.budgetKobo} > 0`),
  check('advertising_bookings_check', sql`${table.endsOn} >= ${table.startsOn}`),
  index('advertising_bookings_status_dates_idx').on(table.status, table.startsOn, table.endsOn),
])
