import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is required for the Fish Guy music catalog.')
}

export const pool = new Pool({ connectionString, max: 5 })
export const db = drizzle(pool, { schema })
