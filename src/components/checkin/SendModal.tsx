// src/components/checkin/SendModal.tsx
type Props = {
  weekLabel: string
  onConfirm: () => void
  onCancel: () => void
  sending: boolean
}

export default function SendModal({ weekLabel, onConfirm, onCancel, sending }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        zIndex: 50,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '32px',
          width: '100%',
          maxWidth: '380px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📬</div>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '800',
              letterSpacing: '-0.3px',
              marginBottom: '8px',
            }}
          >
            Send your check-in?
          </h2>
          <p style={{ fontSize: '14px', color: '#888', lineHeight: '1.5' }}>
            This will email your check-in for{' '}
            <strong style={{ color: '#111' }}>{weekLabel}</strong>
          </p>
        </div>

        <div
          style={{
            background: '#fafafa',
            borderRadius: '10px',
            padding: '14px',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            fontSize: '12px',
            color: '#666',
          }}
        >
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ color: '#aaa', minWidth: '32px' }}>To</span>
            <span>isabelle.andrews@resy.com</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ color: '#aaa', minWidth: '32px' }}>CC</span>
            <span>tj.voutier@resy.com</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ color: '#aaa', minWidth: '32px' }}>BCC</span>
            <span>tjvoutier@gmail.com</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={onConfirm}
            disabled={sending}
            style={{
              background: 'linear-gradient(135deg, #e11d48, #f59e0b)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '13px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: sending ? 'not-allowed' : 'pointer',
              opacity: sending ? 0.7 : 1,
            }}
          >
            {sending ? 'Sending…' : 'Send now →'}
          </button>
          <button
            onClick={onCancel}
            disabled={sending}
            style={{
              background: '#f4f4f4',
              color: '#333',
              border: 'none',
              borderRadius: '10px',
              padding: '13px',
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
