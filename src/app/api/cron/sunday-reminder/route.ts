import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateCheckin } from '@/lib/checkin/db'
import { sendReminderEmail } from '@/lib/checkin/email'
import { getWeekStart, toDateString } from '@/lib/checkin/week'

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const weekStart = toDateString(getWeekStart(new Date()))
  const checkin = await getOrCreateCheckin(weekStart)

  if (checkin.status === 'submitted') {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  await sendReminderEmail(
    appUrl,
    "Your weekly check-in hasn't been submitted yet — it closes Monday at midnight ET."
  )

  return NextResponse.json({ ok: true, sent: true })
}
