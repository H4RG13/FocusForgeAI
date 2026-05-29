'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TimerPhase = 'focus' | 'short_break' | 'long_break';

interface FocusState {
  sessionId: number | null;
  phase: TimerPhase;
  secondsRemaining: number;
  isRunning: boolean;
  pomodoroCount: number;
  durationMinutes: number;

  startSession: (sessionId: number, durationMinutes: number) => void;
  tick: () => void;
  pause: () => void;
  resume: () => void;
  endSession: () => void;
  setPhase: (phase: TimerPhase, seconds: number) => void;
}

const PHASE_DURATIONS: Record<TimerPhase, number> = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

export const useFocusStore = create<FocusState>()(
  persist(
    (set) => ({
      sessionId: null,
      phase: 'focus',
      secondsRemaining: PHASE_DURATIONS.focus,
      isRunning: false,
      pomodoroCount: 0,
      durationMinutes: 25,

      startSession: (sessionId, durationMinutes) =>
        set({
          sessionId,
          phase: 'focus',
          secondsRemaining: durationMinutes * 60,
          durationMinutes,
          isRunning: true,
        }),

      tick: () =>
        set((s) => ({
          secondsRemaining: Math.max(0, s.secondsRemaining - 1),
        })),

      pause: () => set({ isRunning: false }),
      resume: () => set({ isRunning: true }),

      endSession: () =>
        set({
          sessionId: null,
          phase: 'focus',
          secondsRemaining: PHASE_DURATIONS.focus,
          isRunning: false,
        }),

      setPhase: (phase, seconds) =>
        set({ phase, secondsRemaining: seconds, isRunning: false }),
    }),
    {
      name: 'focus-timer',
      partialize: (s) => ({
        sessionId: s.sessionId,
        phase: s.phase,
        secondsRemaining: s.secondsRemaining,
        isRunning: s.isRunning,
        pomodoroCount: s.pomodoroCount,
        durationMinutes: s.durationMinutes,
      }),
    }
  )
);
