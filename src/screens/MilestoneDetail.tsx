'use client';

import { useApp } from '@/context/AppContext';
import { milestoneCatalog } from '@/data/milestoneCatalog';

export default function MilestoneDetail() {
  const { milestoneDetailId, setMilestoneDetailId, state } = useApp();

  if (!milestoneDetailId) return null;

  const milestone = milestoneCatalog.find((m) => m.id === milestoneDetailId);
  if (!milestone) return null;

  const earned = state.milestones.earned.find((e) => e.id === milestoneDetailId);
  const isEarned = !!earned;
  const isLocked =
    !isEarned &&
    !state.milestones.inProgress.some((m) => m.id === milestoneDetailId);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setMilestoneDetailId(null)}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 50,
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#161616',
          borderTop: '1px solid #2A2A2A',
          borderRadius: '16px 16px 0 0',
          padding: '20px 20px 32px',
          zIndex: 51,
          animation: 'slideUpSheet 0.25s ease-out',
        }}
      >
        {/* Handle */}
        <div
          style={{
            width: 32,
            height: 3,
            background: '#2A2A2A',
            borderRadius: 2,
            margin: '0 auto 20px',
          }}
        />

        {/* Emoji */}
        <div
          style={{
            fontSize: 36,
            textAlign: 'center',
            marginBottom: 12,
            opacity: isLocked ? 0.35 : 1,
          }}
        >
          {milestone.emoji}
        </div>

        {/* Name */}
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 400,
            color: '#F5F0E8',
            textAlign: 'center',
            marginBottom: 8,
            opacity: isLocked ? 0.5 : 1,
          }}
        >
          {milestone.name}
        </div>

        {/* Dimension label */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#5A5650',
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          {milestone.dimension}
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: '#2A2A2A',
            marginBottom: 18,
          }}
        />

        {isEarned && (
          <>
            <Row label="How you earned it" value={milestone.triggerDescription} />
            <Row
              label="Unlocked"
              value={new Date(earned.earnedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
              valueColor="#C9A96E"
            />
          </>
        )}

        {!isEarned && !isLocked && (
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: '#8C8880',
              lineHeight: 1.6,
              textAlign: 'center',
            }}
          >
            {milestone.progressHint}
          </div>
        )}

        {isLocked && (
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: '#5A5650',
              lineHeight: 1.6,
              textAlign: 'center',
              fontStyle: 'italic',
            }}
          >
            {milestone.lockedHint}
          </div>
        )}

        {/* Status pill */}
        <div
          style={{
            marginTop: 20,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              borderRadius: 100,
              border: `1px solid ${isEarned ? 'rgba(201,169,110,0.4)' : '#2A2A2A'}`,
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: isEarned ? '#C9A96E' : '#5A5650',
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: isEarned ? '#C9A96E' : '#3A3A3A',
              }}
            />
            {isEarned ? 'Earned' : isLocked ? 'Locked' : 'In Progress'}
          </div>
        </div>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#5A5650',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          color: valueColor ?? '#C8C2B8',
          lineHeight: 1.5,
        }}
      >
        {value}
      </div>
    </div>
  );
}
