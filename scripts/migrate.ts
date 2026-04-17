import { sql } from '@vercel/postgres'

async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS check_ins (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      week_start      DATE NOT NULL UNIQUE,
      highlights      TEXT,
      challenges      TEXT,
      priorities      TEXT,
      talking_points  TEXT,
      shoutouts       TEXT,
      status          TEXT NOT NULL DEFAULT 'draft',
      submitted_at    TIMESTAMPTZ,
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
  console.log('Migration complete')
  process.exit(0)
}

migrate().catch((e) => { console.error(e); process.exit(1) })
