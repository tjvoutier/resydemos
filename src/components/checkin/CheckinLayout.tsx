// src/components/checkin/CheckinLayout.tsx
import Link from 'next/link'

type Props = {
  weekLabel: string
  children: React.ReactNode
}

export default function CheckinLayout({ weekLabel, children }: Props) {
  return (
    <div style={{ minHeight: '100vh', background: '#fffbf7' }}>
      {/* Gradient header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #e11d48 0%, #f59e0b 100%)',
          padding: '24px 24px 28px',
          color: '#fff',
        }}
      >
        <div
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: '600',
                marginBottom: '10px',
                letterSpacing: '0.5px',
              }}
            >
              ✦ Weekly Check-In
            </div>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: '800',
                letterSpacing: '-0.5px',
                marginBottom: '4px',
              }}
            >
              {weekLabel}
            </h1>
          </div>
          <Link
            href="/history"
            style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '13px',
              textDecoration: 'none',
              paddingTop: '4px',
            }}
          >
            History →
          </Link>
        </div>
      </div>

      {/* Page body */}
      <div
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: '24px 24px 48px',
        }}
      >
        {children}
      </div>
    </div>
  )
}
