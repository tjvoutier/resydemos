'use client';

import { useApp } from '@/context/AppContext';
import ChallengesView from './ChallengesView';
import MilestonesView from './MilestonesView';

export default function PassportTab() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Segmented control */}
      <div
        style={{
          padding: '12px 14px 0',
          background: '#0D0D0D',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            background: '#161616',
            border: '1px solid #2A2A2A',
            borderRadius: 8,
            padding: 3,
          }}
        >
          {(['challenges', 'story'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                background: activeTab === tab ? '#232323' : 'none',
                border: activeTab === tab ? '1px solid #333' : '1px solid transparent',
                borderRadius: 6,
                padding: '7px 8px',
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: activeTab === tab ? '#F5F0E8' : '#5A5650',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {tab === 'challenges' ? 'Challenges' : 'Your Story'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'challenges' ? <ChallengesView /> : <MilestonesView />}
      </div>
    </div>
  );
}
