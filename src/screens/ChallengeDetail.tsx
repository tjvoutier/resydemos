'use client';

import { useApp } from '@/context/AppContext';
import { challengeCatalog } from '@/data/challengeCatalog';
import Image from 'next/image';

function daysLeft(dateStr: string) {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function ChallengeDetail({ challengeId }: { challengeId: string }) {
  const { state, navigate, handleVisit } = useApp();

  const challenge = challengeCatalog.find((c) => c.id === challengeId);
  if (!challenge) return null;

  const progress = state.challengeProgress[challengeId];
  const visited = progress?.visitedVenueIds ?? [];
  const visitedCount = visited.length;
  const pct = (visitedCount / challenge.requiredVisits) * 100;
  const days = daysLeft(challenge.endsAt);
  const isCompleted = progress?.state === 'completed';

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#0D0D0D',
        animation: 'slideInRight 0.22s ease-out',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          padding: '14px 14px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <button
          onClick={() => navigate({ name: 'passport' })}
          style={{
            background: 'none',
            border: 'none',
            color: '#D64D2D',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.1em',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          ← Back
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
        {/* Editorial tag */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#8C8880',
            marginBottom: 8,
          }}
        >
          {challenge.editorialTag}
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 400,
            fontStyle: 'italic',
            color: '#F5F0E8',
            lineHeight: 1.15,
            marginBottom: 10,
          }}
        >
          {challenge.name}
        </div>

        {/* Description */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: '#8C8880',
            lineHeight: 1.6,
            marginBottom: 16,
          }}
        >
          {challenge.description}
        </p>

        {/* Progress block */}
        <div
          style={{
            background: '#161616',
            border: '1px solid #2A2A2A',
            borderRadius: 8,
            padding: '12px 14px',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: isCompleted ? '#C9A96E' : '#D64D2D',
              }}
            >
              {isCompleted ? 'Completed ✓' : `${visitedCount} of ${challenge.requiredVisits} visited`}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: '#5A5650',
              }}
            >
              {isCompleted ? '' : days > 0 ? `${days} days left` : 'Expired'}
            </div>
          </div>
          <div
            style={{
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
                background: isCompleted ? '#C9A96E' : '#D64D2D',
                borderRadius: 2,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Reward */}
        <div
          style={{
            background: 'rgba(201, 169, 110, 0.06)',
            border: '1px solid rgba(201, 169, 110, 0.2)',
            borderRadius: 8,
            padding: '12px 14px',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#C9A96E',
              marginBottom: 6,
            }}
          >
            Reward on completion
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              color: '#EDE8DC',
              lineHeight: 1.5,
            }}
          >
            {challenge.rewardDescription}
          </div>
        </div>

        {/* Venue list */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#5A5650',
            marginBottom: 10,
          }}
        >
          Qualifying Restaurants
        </div>

        {challenge.qualifyingVenues.map((venue) => {
          const isVisited = visited.includes(venue.id);
          return (
            <div
              key={venue.id}
              style={{
                background: '#161616',
                border: `1px solid ${isVisited ? 'rgba(201,169,110,0.3)' : '#2A2A2A'}`,
                borderRadius: 10,
                marginBottom: 10,
                overflow: 'hidden',
              }}
            >
              {/* Image */}
              <div style={{ position: 'relative', height: 80, width: '100%' }}>
                <Image
                  src={venue.imageUrl}
                  alt={venue.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  unoptimized
                />
                {isVisited && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: 'rgba(201,169,110,0.9)',
                      borderRadius: '50%',
                      width: 22,
                      height: 22,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: '10px 12px 12px' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 14,
                    color: '#F5F0E8',
                    marginBottom: 2,
                  }}
                >
                  {venue.name}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 8.5,
                    color: '#5A5650',
                    letterSpacing: '0.08em',
                    marginBottom: 6,
                  }}
                >
                  {venue.neighborhood} · {venue.cuisine}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 11,
                    color: '#8C8880',
                    lineHeight: 1.4,
                    marginBottom: isVisited ? 0 : 10,
                  }}
                >
                  {venue.description}
                </div>

                {!isVisited && !isCompleted && (
                  <button
                    onClick={() => handleVisit(venue.id, challengeId)}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: '1px solid #D64D2D',
                      borderRadius: 6,
                      padding: '8px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#D64D2D',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseOver={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        'rgba(214,77,45,0.08)';
                    }}
                    onMouseOut={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'none';
                    }}
                  >
                    Mark as Visited
                  </button>
                )}

                {isVisited && (
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 8.5,
                      color: '#C9A96E',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Visited ✓
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
