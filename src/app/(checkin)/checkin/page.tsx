// src/app/(checkin)/checkin/page.tsx
import { getOrCreateCheckin } from '@/lib/checkin/db'
import { getWeekStart, formatWeekRange, formatNextWeekRange, isEditable, toDateString } from '@/lib/checkin/week'
import CheckinLayout from '@/components/checkin/CheckinLayout'
import CheckinForm from '@/components/checkin/CheckinForm'
import SubmittedView from '@/components/checkin/SubmittedView'

export default async function CheckinPage() {
  const weekStart = getWeekStart(new Date())
  const weekStartStr = toDateString(weekStart)
  const checkin = await getOrCreateCheckin(weekStartStr)
  const weekLabel = `Week of ${formatWeekRange(weekStart)}`
  const nextWeekRange = formatNextWeekRange(weekStart)
  const editable = isEditable(weekStart)

  return (
    <CheckinLayout weekLabel={weekLabel}>
      {checkin.status === 'submitted' || !editable ? (
        <SubmittedView
          checkin={checkin}
          weekLabel={weekLabel}
          nextWeekRange={nextWeekRange}
          submittedAt={checkin.submitted_at}
        />
      ) : (
        <CheckinForm
          checkin={checkin}
          weekLabel={weekLabel}
          nextWeekRange={nextWeekRange}
        />
      )}
    </CheckinLayout>
  )
}
