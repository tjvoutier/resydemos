import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateCheckin, upsertCheckin } from '@/lib/checkin/db'
import { getWeekStart, toDateString } from '@/lib/checkin/week'

export async function GET() {
  const weekStart = toDateString(getWeekStart(new Date()))
  const checkin = await getOrCreateCheckin(weekStart)
  return NextResponse.json(checkin)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const weekStart = toDateString(getWeekStart(new Date()))
  await upsertCheckin(weekStart, {
    highlights: body.highlights,
    challenges: body.challenges,
    priorities: body.priorities,
    talking_points: body.talking_points,
    shoutouts: body.shoutouts,
  })
  return NextResponse.json({ ok: true })
}
