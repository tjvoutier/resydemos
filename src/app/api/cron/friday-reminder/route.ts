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
    "Don't forget to submit your weekly check-in before end of week."
  )

  return NextResponse.json({ ok: true, sent: true })
}
