// src/components/checkin/ConfirmationScreen.tsx
type UnsplashImage = {
  url: string
  location: string
  photographer: string
}

type Props = {
  weekLabel: string
  image: UnsplashImage
  onDone: () => void
}

export default function ConfirmationScreen({ weekLabel, image, onDone }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#fff',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Hero image */}
      <div style={{ position: 'relative', flex: '0 0 55vh', overflow: 'hidden' }}>
        <img
          src={image.url}
          alt={image.location}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '28px',
            left: 0,
            right: 0,
            textAlign: 'center',
            color: '#fff',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>✅</div>
          <div
            style={{
              fontSize: '26px',
              fontWeight: '800',
              letterSpacing: '-0.5px',
              marginBottom: '4px',
            }}
          >
            Check-in sent!
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>{weekLabel}</div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '12px',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          {image.location} · Photo by {image.photographer} on Unsplash
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <p style={{ textAlign: 'center', fontSize: '14px', color: '#444', lineHeight: 1.6 }}>
          Your check-in was emailed to <strong>Isabelle</strong> and a copy sent to you.
          <br />
          <span style={{ color: '#aaa', fontSize: '12px' }}>
            isabelle.andrews@resy.com · cc: tj.voutier@resy.com
          </span>
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center',
          }}
        >
          {['🏆 Highlights', '⚡ Challenges', '📅 Priorities', '🗣️ Talking Points', '👏 Shoutouts'].map(
            (s) => (
              <span
                key={s}
                style={{
                  background: '#fdf2f8',
                  border: '1px solid #fde8d1',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  color: '#e11d48',
                }}
              >
                {s}
              </span>
            )
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <a
            href="/history"
            style={{
              flex: 1,
              background: '#f4f4f4',
              borderRadius: '10px',
              padding: '13px',
              textAlign: 'center',
              fontSize: '14px',
              color: '#333',
              textDecoration: 'none',
              fontWeight: '500',
            }}
          >
            View History
          </a>
          <button
            onClick={onDone}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #e11d48, #f59e0b)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '13px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
