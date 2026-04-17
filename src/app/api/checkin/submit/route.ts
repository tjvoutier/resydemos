import { NextRequest, NextResponse } from 'next/server'
import { upsertCheckin, submitCheckin, getCheckin } from '@/lib/checkin/db'
import { sendCheckinEmail } from '@/lib/checkin/email'
import { fetchConfirmationImage } from '@/lib/checkin/unsplash'
import { getWeekStart, formatWeekRange, formatNextWeekRange, toDateString } from '@/lib/checkin/week'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const weekStart = getWeekStart(new Date())
  const weekStartStr = toDateString(weekStart)

  // Save final content before submitting
  await upsertCheckin(weekStartStr, {
    highlights: body.highlights,
    challenges: body.challenges,
    priorities: body.priorities,
    talking_points: body.talking_points,
    shoutouts: body.shoutouts,
  })

  // Mark as submitted
  await submitCheckin(weekStartStr)

  // Fetch updated record for email
  const checkin = await getCheckin(weekStartStr)
  if (!checkin) {
    return NextResponse.json({ error: 'Check-in not found' }, { status: 404 })
  }

  // Guard against double-submit: already submitted, just return an image
  if (checkin.status === 'submitted') {
    const image = await fetchConfirmationImage()
    return NextResponse.json({ ok: true, image })
  }

  const weekLabel = `Week of ${formatWeekRange(weekStart)}`
  const nextWeekRange = formatNextWeekRange(weekStart)
  const subject = `Weekly Check-In — ${weekLabel}`

  // Send email and fetch image in parallel
  const [, image] = await Promise.all([
    sendCheckinEmail(checkin, nextWeekRange, weekLabel, subject),
    fetchConfirmationImage(),
  ])

  return NextResponse.json({ ok: true, image })
}
