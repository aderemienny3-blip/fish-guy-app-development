import { boolean, date, integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

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
