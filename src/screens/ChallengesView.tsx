'use client';

import { useApp } from '@/context/AppContext';
import { challengeCatalog } from '@/data/challengeCatalog';

function daysUntil(dateStr: string) {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function daysLeft(dateStr: string) {
  return daysUntil(dateStr);
}

export default function ChallengesView() {
  const { state, navigate, user } = useApp();

  const activeChallenges = challengeCatalog.filter(
    (c) => state.challengeProgress[c.id]?.state === 'active'
  );
  const upcomingChallenges = challengeCatalog.filter(
    (c) => state.challengeProgress[c.id]?.state === 'upcoming'
  );
  const completedChallenges = challengeCatalog.filter(
    (c) => state.challengeProgress[c.id]?.state === 'completed'
  );

  return (
    <div style={{ padding: '16px 14px', overflowY: 'auto', height: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#8C8880',
              marginBottom: 2,
            }}
          >
            Resy
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              fontWeight: 400,
              color: '#F5F0E8',
              lineHeight: 1,
            }}
          >
            Passport
          </div>
        </div>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: '#C9A96E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-body)',
            fontSize: 11,
            fontWeight: 700,
            color: '#0D0D0D',
          }}
        >
          {user.name.slice(0, 2).toUpperCase()}
        </div>
      </div>

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <>
          <SectionLabel>Active Challenges</SectionLabel>
          {activeChallenges.map((challenge) => {
            const progress = state.challengeProgress[challenge.id];
            const visited = progress.visitedVenueIds.length;
            const pct = (visited / challenge.requiredVisits) * 100;
            const days = daysLeft(challenge.endsAt);
            return (
              <ChallengeCard
                key={challenge.id}
                onClick={() => navigate({ name: 'challengeDetail', challengeId: challenge.id })}
                borderColor="#D64D2D"
              >
                <TagRow color="#D64D2D">
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: '#D64D2D',
                      display: 'inline-block',
                    }}
                  />
                  In Progress · {days > 0 ? `${days} days left` : 'Ending soon'}
                </TagRow>
                <ChallengeName>{challenge.name}</ChallengeName>
                <ChallengeDesc>{challenge.description}</ChallengeDesc>
                <ProgressRow>
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      background: '#242424',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: '#D64D2D',
                        borderRadius: 2,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                  <ProgressText>
                    {visited} / {challenge.requiredVisits}
                  </ProgressText>
                </ProgressRow>
                <DotRow>
                  {Array.from({ length: challenge.requiredVisits }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: i < visited ? '#D64D2D' : 'transparent',
                        border: i < visited ? 'none' : '1px solid #3A3A3A',
                      }}
                    />
                  ))}
                </DotRow>
                <RewardBadge>🔓 {challenge.rewardDescription.split(' — ')[0]}</RewardBadge>
              </ChallengeCard>
            );
          })}
        </>
      )}

      {/* Upcoming Challenges */}
      {upcomingChallenges.length > 0 && (
        <>
          <SectionLabel style={{ marginTop: activeChallenges.length > 0 ? 12 : 0 }}>
            Upcoming
          </SectionLabel>
          {upcomingChallenges.map((challenge) => {
            const daysTo = daysUntil(challenge.startsAt);
            return (
              <ChallengeCard key={challenge.id} borderColor="#2A2A2A">
                <TagRow color="#5A5650">
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: '#3A3A3A',
                      display: 'inline-block',
                    }}
                  />
                  Available · Starts {new Date(challenge.startsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </TagRow>
                <ChallengeName>{challenge.name}</ChallengeName>
                <ChallengeDesc>{challenge.description}</ChallengeDesc>
                <ProgressRow>
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      background: '#242424',
                      borderRadius: 2,
                    }}
                  />
                  <ProgressText>
                    0 / {challenge.requiredVisits}
                  </ProgressText>
                </ProgressRow>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 8,
                    color: '#5A5650',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginTop: 6,
                  }}
                >
                  Opens in {daysTo} days
                </div>
              </ChallengeCard>
            );
          })}
        </>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <>
          <SectionLabel style={{ marginTop: 12 }}>Completed</SectionLabel>
          {completedChallenges.map((challenge) => {
            return (
              <ChallengeCard key={challenge.id} borderColor="#2A2A2A" opacity={0.6}>
                <TagRow color="#C9A96E">
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: '#C9A96E',
                      display: 'inline-block',
                    }}
                  />
                  Completed · {new Date(challenge.endsAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </TagRow>
                <ChallengeName>{challenge.name}</ChallengeName>
                <ProgressRow>
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      background: '#242424',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: '100%',
                        background: '#C9A96E',
                        borderRadius: 2,
                      }}
                    />
                  </div>
                  <ProgressText style={{ color: '#C9A96E' }}>
                    {challenge.requiredVisits} / {challenge.requiredVisits} ✓
                  </ProgressText>
                </ProgressRow>
              </ChallengeCard>
            );
          })}
        </>
      )}

      <div style={{ height: 32 }} />
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

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

function ChallengeCard({
  children,
  onClick,
  borderColor,
  opacity,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  borderColor: string;
  opacity?: number;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#161616',
        border: `1px solid ${borderColor}`,
        borderRadius: 10,
        padding: '14px 14px 12px',
        marginBottom: 10,
        cursor: onClick ? 'pointer' : 'default',
        opacity: opacity ?? 1,
      }}
    >
      {children}
    </div>
  );
}

function TagRow({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color,
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}

function ChallengeName({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: 14,
        color: '#F5F0E8',
        marginBottom: 4,
        lineHeight: 1.2,
      }}
    >
      {children}
    </div>
  );
}

function ChallengeDesc({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: 9.5,
        color: '#8C8880',
        marginBottom: 10,
        lineHeight: 1.4,
      }}
    >
      {children}
    </div>
  );
}

function ProgressRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      {children}
    </div>
  );
}

function ProgressText({
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
        fontSize: 9,
        color: '#8C8880',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function DotRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>{children}</div>;
}

function RewardBadge({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: 'rgba(201, 169, 110, 0.1)',
        border: '1px solid rgba(201, 169, 110, 0.3)',
        borderRadius: 4,
        padding: '3px 8px',
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: '#C9A96E',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginTop: 8,
      }}
    >
      {children}
    </div>
  );
}
