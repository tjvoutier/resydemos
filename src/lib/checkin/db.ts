import { sql } from '@vercel/postgres'

export type CheckIn = {
  id: string
  week_start: string        // YYYY-MM-DD
  highlights: string | null
  challenges: string | null
  priorities: string | null
  talking_points: string | null
  shoutouts: string | null
  status: 'draft' | 'submitted'
  submitted_at: string | null
  updated_at: string
}

export type CheckInUpdate = Partial<
  Pick<CheckIn, 'highlights' | 'challenges' | 'priorities' | 'talking_points' | 'shoutouts'>
>

// Get existing check-in for a week, or create a draft if none exists
export async function getOrCreateCheckin(weekStart: string): Promise<CheckIn> {
  await sql`
    INSERT INTO check_ins (week_start)
    VALUES (${weekStart})
    ON CONFLICT (week_start) DO NOTHING
  `
  const result = await sql<CheckIn>`
    SELECT * FROM check_ins WHERE week_start = ${weekStart}
  `
  return result.rows[0]
}

// Auto-save: update one or more fields
export async function upsertCheckin(weekStart: string, data: CheckInUpdate): Promise<void> {
  await sql`
    UPDATE check_ins
    SET
      highlights     = COALESCE(${data.highlights ?? null}, highlights),
      challenges     = COALESCE(${data.challenges ?? null}, challenges),
      priorities     = COALESCE(${data.priorities ?? null}, priorities),
      talking_points = COALESCE(${data.talking_points ?? null}, talking_points),
      shoutouts      = COALESCE(${data.shoutouts ?? null}, shoutouts),
      updated_at     = now()
    WHERE week_start = ${weekStart}
      AND status = 'draft'
  `
}

// Mark submitted and record the timestamp
export async function submitCheckin(weekStart: string): Promise<void> {
  await sql`
    UPDATE check_ins
    SET status = 'submitted', submitted_at = now(), updated_at = now()
    WHERE week_start = ${weekStart}
  `
}

// Get a single check-in by week_start
export async function getCheckin(weekStart: string): Promise<CheckIn | null> {
  const { rows } = await sql<CheckIn>`
    SELECT * FROM check_ins WHERE week_start = ${weekStart}
  `
  return rows[0] ?? null
}

// List all submitted check-ins, newest first
export async function listSubmittedCheckins(): Promise<CheckIn[]> {
  const { rows } = await sql<CheckIn>`
    SELECT * FROM check_ins
    WHERE status = 'submitted'
    ORDER BY week_start DESC
  `
  return rows
}

// Get the current week's check-in (draft or submitted)
export async function getCurrentCheckin(): Promise<CheckIn | null> {
  const { rows } = await sql<CheckIn>`
    SELECT * FROM check_ins
    ORDER BY week_start DESC
    LIMIT 1
  `
  return rows[0] ?? null
}
