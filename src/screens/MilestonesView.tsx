'use client';

import { useApp } from '@/context/AppContext';
import { milestoneCatalog } from '@/data/milestoneCatalog';
import ProgressRing from '@/components/ProgressRing';

export default function MilestonesView() {
  const { state, setMilestoneDetailId, simulateMilestoneUnlock } = useApp();
  const { milestones } = state;

  const earnedIds = milestones.earned.map((e) => e.id);

  // Rings: cuisines (target 10), neighborhoods (target 8), regular (complete)
  const cuisineRingValue = milestones.cuisinesExplored;
  const hoodRingValue = milestones.neighborhoodsVisited;
  const regularComplete = milestones.isRegularSomewhere;

  return (
    <div style={{ padding: '16px 14px', overflowY: 'auto', height: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 400,
            color: '#F5F0E8',
            marginBottom: 3,
          }}
        >
          Your Dining{' '}
          <em style={{ fontStyle: 'italic', color: '#EDE8DC' }}>Identity</em>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#8C8880',
          }}
        >
          Based on your Resy history
        </div>
      </div>

      {/* Rings row */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 22,
          justifyContent: 'space-between',
        }}
      >
        <ProgressRing
          value={cuisineRingValue}
          max={10}
          color="#D64D2D"
          label="Cuisines"
          centerLabel={String(cuisineRingValue)}
        />
        <ProgressRing
          value={hoodRingValue}
          max={8}
          color="#D64D2D"
          label="Hoods"
          centerLabel={String(hoodRingValue)}
        />
        <ProgressRing
          value={regularComplete ? 1 : 0}
          max={1}
          color="#C9A96E"
          label="Regular"
          centerLabel={regularComplete ? '✓' : '–'}
        />
      </div>

      {/* Recent Unlocks */}
      <SectionLabel>Recent Unlocks</SectionLabel>
      {milestones.earned.map((earned) => {
        const def = milestoneCatalog.find((m) => m.id === earned.id);
        if (!def) return null;
        return (
          <MilestoneRow
            key={earned.id}
            emoji={def.emoji}
            name={def.name}
            sub={def.triggerDescription}
            indicator="●"
            indicatorColor="#D64D2D"
            iconBg="rgba(214, 77, 45, 0.12)"
            onClick={() => setMilestoneDetailId(def.id)}
            style={{ cursor: 'pointer' }}
          />
        );
      })}

      {/* Up Next */}
      <SectionLabel style={{ marginTop: 14 }}>Up Next</SectionLabel>
      {milestones.inProgress.map((ip) => {
        const def = milestoneCatalog.find((m) => m.id === ip.id);
        if (!def) return null;
        return (
          <MilestoneRow
            key={ip.id}
            emoji={def.emoji}
            name={def.name}
            sub={def.progressHint}
            indicator="○"
            indicatorColor="#3A3A3A"
            iconBg="#1A1A1A"
            iconOpacity={0.5}
            onClick={() => setMilestoneDetailId(def.id)}
            style={{ cursor: 'pointer' }}
          />
        );
      })}

      {/* Locked milestones (a few teasers) */}
      <SectionLabel style={{ marginTop: 14 }}>Explore More</SectionLabel>
      {milestoneCatalog
        .filter((m) => !earnedIds.includes(m.id) && !milestones.inProgress.some((ip) => ip.id === m.id))
        .slice(0, 3)
        .map((m) => (
          <MilestoneRow
            key={m.id}
            emoji={m.emoji}
            name={m.name}
            sub={m.lockedHint}
            indicator="○"
            indicatorColor="#2A2A2A"
            iconBg="#141414"
            iconOpacity={0.3}
            onClick={() => setMilestoneDetailId(m.id)}
            style={{ cursor: 'pointer', opacity: 0.5 }}
          />
        ))}

      {/* Research session demo button */}
      <div
        style={{
          marginTop: 24,
          padding: '14px',
          background: '#111',
          border: '1px solid #1E1E1E',
          borderRadius: 8,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#3A3A3A',
            marginBottom: 10,
          }}
        >
          Session Demo · Simulate Booking
        </div>
        {milestones.inProgress.map((ip) => {
          const def = milestoneCatalog.find((m) => m.id === ip.id);
          if (!def) return null;
          return (
            <button
              key={ip.id}
              onClick={() => simulateMilestoneUnlock(ip.id)}
              style={{
                display: 'block',
                width: '100%',
                background: 'none',
                border: '1px solid #2A2A2A',
                borderRadius: 6,
                padding: '8px 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.08em',
                color: '#5A5650',
                cursor: 'pointer',
                textAlign: 'left',
                marginBottom: 6,
              }}
            >
              + Unlock "{def.name}" {def.emoji}
            </button>
          );
        })}
      </div>

      <div style={{ height: 32 }} />
    </div>
  );
}

function SectionLabel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#5A5650',
        marginBottom: 8,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function MilestoneRow({
  emoji,
  name,
  sub,
  indicator,
  indicatorColor,
  iconBg,
  iconOpacity,
  onClick,
  style,
}: {
  emoji: string;
  name: string;
  sub: string;
  indicator: string;
  indicatorColor: string;
  iconBg: string;
  iconOpacity?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 0',
        borderBottom: '1px solid #1A1A1A',
        ...style,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          flexShrink: 0,
          opacity: iconOpacity ?? 1,
        }}
      >
        {emoji}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: '#F5F0E8',
            fontWeight: 500,
            lineHeight: 1.2,
            marginBottom: 2,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            color: '#5A5650',
            letterSpacing: '0.06em',
          }}
        >
          {sub}
        </div>
      </div>
      <div style={{ fontSize: 11, color: indicatorColor }}>{indicator}</div>
    </div>
  );
}
