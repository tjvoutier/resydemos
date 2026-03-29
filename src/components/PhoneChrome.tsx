'use client';

import { useApp } from '@/context/AppContext';
import PassportTab from '@/screens/PassportTab';
import ChallengeDetail from '@/screens/ChallengeDetail';
import RewardUnlock from '@/screens/RewardUnlock';
import MilestoneDetail from '@/screens/MilestoneDetail';
import ToastBanner from './ToastBanner';

export default function PhoneChrome() {
  const { screen, milestoneDetailId } = useApp();

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#080808',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      {/* Phone frame */}
      <div
        style={{
          width: 375,
          height: 812,
          background: '#0A0A0A',
          border: '1.5px solid #2E2E2E',
          borderRadius: 44,
          padding: '0 0',
          position: 'relative',
          boxShadow:
            '0 32px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Status bar */}
        <div
          style={{
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: '#F5F0E8',
              fontWeight: 500,
            }}
          >
            {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </div>
          {/* Dynamic island pill */}
          <div
            style={{
              width: 90,
              height: 26,
              background: '#000',
              borderRadius: 13,
              border: '1.5px solid #1A1A1A',
            }}
          />
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: '#F5F0E8',
            }}
          >
            ▮▮▮
          </div>
        </div>

        {/* Screen area */}
        <div
          style={{
            flex: 1,
            background: '#0D0D0D',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Screens */}
          {screen.name === 'passport' && <PassportTab />}
          {screen.name === 'challengeDetail' && (
            <ChallengeDetail challengeId={screen.challengeId} />
          )}
          {screen.name === 'rewardUnlock' && (
            <RewardUnlock challengeId={screen.challengeId} />
          )}

          {/* Milestone detail sheet overlay */}
          {milestoneDetailId && <MilestoneDetail />}

          {/* Toast banners */}
          <ToastBanner />
        </div>

        {/* Home indicator */}
        <div
          style={{
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            background: '#0D0D0D',
          }}
        >
          <div
            style={{
              width: 120,
              height: 4,
              background: '#2A2A2A',
              borderRadius: 2,
            }}
          />
        </div>
      </div>
    </div>
  );
}
