'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { challengeCatalog } from '@/data/challengeCatalog';

const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function RewardUnlock({ challengeId }: { challengeId: string }) {
  const { navigate } = useApp();
  const [filled, setFilled] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const challenge = challengeCatalog.find((c) => c.id === challengeId);
  if (!challenge) return null;

  useEffect(() => {
    const t1 = setTimeout(() => setFilled(true), 200);
    const t2 = setTimeout(() => setShowContent(true), 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const dashoffset = filled ? 0 : CIRCUMFERENCE;

  return (
    <div
      style={{
        height: '100%',
        background: '#0A0A0A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      {/* Gold ring */}
      <div style={{ position: 'relative', width: 100, height: 100, marginBottom: 28 }}>
        <svg width={100} height={100} viewBox="0 0 100 100">
          <circle cx={50} cy={50} r={RADIUS} fill="none" stroke="#1A1A1A" strokeWidth={4} />
          <circle
            cx={50}
            cy={50}
            r={RADIUS}
            fill="none"
            stroke="#C9A96E"
            strokeWidth={4}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 26,
            opacity: filled ? 1 : 0,
            transition: 'opacity 0.4s ease 0.6s',
          }}
        >
          ✓
        </div>
      </div>

      <div
        style={{
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        {/* Label */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#C9A96E',
            marginBottom: 10,
          }}
        >
          Challenge Complete
        </div>

        {/* Challenge name */}
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            fontWeight: 400,
            fontStyle: 'italic',
            color: '#F5F0E8',
            lineHeight: 1.2,
            marginBottom: 20,
          }}
        >
          {challenge.name}
        </div>

        {/* Divider */}
        <div
          style={{
            width: 40,
            height: 1,
            background: '#2A2A2A',
            marginBottom: 20,
          }}
        />

        {/* Reward */}
        <div
          style={{
            background: 'rgba(201, 169, 110, 0.06)',
            border: '1px solid rgba(201, 169, 110, 0.2)',
            borderRadius: 8,
            padding: '14px 16px',
            marginBottom: 28,
            width: '100%',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#C9A96E',
              marginBottom: 8,
            }}
          >
            Your Reward
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: '#EDE8DC',
              lineHeight: 1.55,
            }}
          >
            {challenge.rewardDescription}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate({ name: 'passport' })}
          style={{
            width: '100%',
            background: '#D64D2D',
            border: 'none',
            borderRadius: 8,
            padding: '12px',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#F5F0E8',
            cursor: 'pointer',
            marginBottom: 12,
          }}
        >
          See Your Reward
        </button>

        <button
          onClick={() => navigate({ name: 'passport' })}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#5A5650',
            cursor: 'pointer',
          }}
        >
          Back to Passport
        </button>
      </div>
    </div>
  );
}
