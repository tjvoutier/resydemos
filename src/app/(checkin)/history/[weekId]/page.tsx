import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCheckin } from '@/lib/checkin/db'
import { formatWeekRange, formatNextWeekRange } from '@/lib/checkin/week'
import SubmittedView from '@/components/checkin/SubmittedView'

type Props = {
  params: Promise<{ weekId: string }>
}

export default async function HistoryDetailPage({ params }: Props) {
  const { weekId } = await params
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekId)) notFound()
  const checkin = await getCheckin(weekId)

  if (!checkin || checkin.status !== 'submitted') notFound()

  const weekStart = new Date(weekId + 'T00:00:00Z')
  const weekLabel = `Week of ${formatWeekRange(weekStart)}`
  const nextWeekRange = formatNextWeekRange(weekStart)

  return (
    <div style={{ minHeight: '100vh', background: '#fffbf7' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #e11d48 0%, #f59e0b 100%)',
          padding: '24px 24px 28px',
          color: '#fff',
        }}
      >
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.75, marginBottom: '8px' }}>
              ✦ Past Check-In
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              {weekLabel}
            </h1>
          </div>
          <Link href="/history" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', textDecoration: 'none' }}>
            ← History
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 24px 48px' }}>
        <SubmittedView
          checkin={checkin}
          weekLabel={weekLabel}
          nextWeekRange={nextWeekRange}
          submittedAt={checkin.submitted_at}
        />
      </div>
    </div>
  )
}
