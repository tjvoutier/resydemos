'use client';

interface ProgressRingProps {
  value: number;
  max: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  label: string;
  centerLabel: string;
  animate?: boolean;
}

const RADIUS = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // 138.23

export default function ProgressRing({
  value,
  max,
  color,
  size = 52,
  strokeWidth = 3,
  label,
  centerLabel,
  animate = true,
}: ProgressRingProps) {
  const pct = Math.min(value / max, 1);
  const dashoffset = CIRCUMFERENCE * (1 - pct);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={RADIUS}
            fill="none"
            stroke="#242424"
            strokeWidth={strokeWidth}
          />
          {/* Fill */}
          <circle
            cx={cx}
            cy={cy}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={
              animate
                ? { transition: 'stroke-dashoffset 0.6s ease-out' }
                : undefined
            }
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 500,
            color: pct >= 1 ? color : '#F5F0E8',
            lineHeight: 1,
            textAlign: 'center',
          }}
        >
          {centerLabel}
        </div>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 7.5,
          color: '#8C8880',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          textAlign: 'center',
        }}
      >
        {label}
      </div>
    </div>
  );
}
