'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { seedState, ChallengeProgress, MilestonesState, BookingRecord } from '@/data/seedState';
import { challengeCatalog } from '@/data/challengeCatalog';
import { milestoneCatalog } from '@/data/milestoneCatalog';

export type Screen =
  | { name: 'passport' }
  | { name: 'challengeDetail'; challengeId: string }
  | { name: 'rewardUnlock'; challengeId: string };

export interface Toast {
  id: string;
  message: string;
}

interface AppState {
  challengeProgress: Record<string, ChallengeProgress>;
  milestones: MilestonesState;
  bookingHistory: BookingRecord[];
}

interface AppContextType {
  user: typeof seedState.user;
  state: AppState;
  screen: Screen;
  navigate: (screen: Screen) => void;
  toasts: Toast[];
  handleVisit: (venueId: string, challengeId: string) => void;
  simulateMilestoneUnlock: (milestoneId: string) => void;
  activeTab: 'challenges' | 'story';
  setActiveTab: (tab: 'challenges' | 'story') => void;
  milestoneDetailId: string | null;
  setMilestoneDetailId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    challengeProgress: seedState.challengeProgress,
    milestones: seedState.milestones,
    bookingHistory: seedState.bookingHistory,
  });
  const [screen, setScreen] = useState<Screen>({ name: 'passport' });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeTab, setActiveTab] = useState<'challenges' | 'story'>('challenges');
  const [milestoneDetailId, setMilestoneDetailId] = useState<string | null>(null);

  const addToast = useCallback((message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const navigate = useCallback((newScreen: Screen) => {
    setScreen(newScreen);
  }, []);

  const handleVisit = useCallback(
    (venueId: string, challengeId: string) => {
      let didComplete = false;
      let challengeName = '';
      let remaining = 0;

      setState((prev) => {
        const cp = prev.challengeProgress[challengeId];
        if (!cp || cp.visitedVenueIds.includes(venueId)) return prev;

        const challenge = challengeCatalog.find((c) => c.id === challengeId);
        if (!challenge) return prev;

        const newVisited = [...cp.visitedVenueIds, venueId];
        didComplete = newVisited.length >= challenge.requiredVisits;
        challengeName = challenge.name;
        remaining = challenge.requiredVisits - newVisited.length;

        const venue = challenge.qualifyingVenues.find((v) => v.id === venueId);

        return {
          ...prev,
          challengeProgress: {
            ...prev.challengeProgress,
            [challengeId]: {
              ...cp,
              state: didComplete ? ('completed' as const) : ('active' as const),
              visitedVenueIds: newVisited,
            },
          },
          bookingHistory: [
            ...prev.bookingHistory,
            {
              venueId,
              venueName: venue?.name ?? '',
              neighborhood: venue?.neighborhood ?? '',
              cuisine: venue?.cuisine ?? '',
              date: new Date().toISOString().split('T')[0],
              partySize: 2,
              status: 'completed' as const,
            },
          ],
        };
      });

      setTimeout(() => {
        if (didComplete) {
          navigate({ name: 'rewardUnlock', challengeId });
        } else if (remaining > 0) {
          addToast(
            `${remaining} more visit${remaining === 1 ? '' : 's'} to complete ${challengeName}`
          );
        }
      }, 80);
    },
    [navigate, addToast]
  );

  const simulateMilestoneUnlock = useCallback(
    (milestoneId: string) => {
      const milestone = milestoneCatalog.find((m) => m.id === milestoneId);
      if (!milestone) return;

      setState((prev) => {
        if (prev.milestones.earned.some((e) => e.id === milestoneId)) return prev;
        return {
          ...prev,
          milestones: {
            ...prev.milestones,
            earned: [
              ...prev.milestones.earned,
              { id: milestoneId, earnedAt: new Date().toISOString().split('T')[0] },
            ],
            inProgress: prev.milestones.inProgress.filter((m) => m.id !== milestoneId),
          },
        };
      });

      addToast(`You just unlocked ${milestone.name} ${milestone.emoji}`);
    },
    [addToast]
  );

  return (
    <AppContext.Provider
      value={{
        user: seedState.user,
        state,
        screen,
        navigate,
        toasts,
        handleVisit,
        simulateMilestoneUnlock,
        activeTab,
        setActiveTab,
        milestoneDetailId,
        setMilestoneDetailId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
