'use client';

import { useApp } from '@/context/AppContext';

export default function ToastBanner() {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: 16,
        right: 16,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            background: '#1E1E1E',
            border: '1px solid #2A2A2A',
            borderRadius: 10,
            padding: '12px 16px',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: '#F5F0E8',
            lineHeight: 1.4,
            animation: 'toastSlideUp 0.25s ease-out',
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
