import Link from 'next/link'
import { listSubmittedCheckins } from '@/lib/checkin/db'
import { formatWeekRange } from '@/lib/checkin/week'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const checkins = await listSubmittedCheckins()

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
              ✦ Weekly Check-In
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              Past Check-Ins
            </h1>
          </div>
          <Link href="/checkin" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', textDecoration: 'none' }}>
            ← This week
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px' }}>
        {checkins.length === 0 ? (
          <p style={{ color: '#aaa', textAlign: 'center', padding: '48px 0', fontSize: '14px' }}>
            No check-ins submitted yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {checkins.map((c) => {
              const weekStart = new Date(c.week_start + 'T00:00:00Z')
              const submittedDate = c.submitted_at
                ? new Date(c.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : ''
              return (
                <Link
                  key={c.week_start}
                  href={`/history/${c.week_start}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    style={{
                      background: '#fff',
                      borderRadius: '12px',
                      border: '1px solid #fde8d1',
                      padding: '16px 18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '3px' }}>
                        Week of {formatWeekRange(weekStart)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#aaa' }}>
                        Submitted {submittedDate}
                      </div>
                    </div>
                    <span style={{ color: '#e11d48', fontSize: '13px' }}>View →</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
