'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useFocusStore, PHASE_DURATIONS } from '@/store/focus.store';
import { useUIStore } from '@/store/ui.store';
import { focusApi } from '@/lib/api/focus';
import { playChime, sendNotification } from '@/lib/utils/sound';
import { FOCUS_KEY, ANALYTICS_KEY } from '@/hooks/useFocus';

const PHASE_LABELS: Record<string, string> = {
  focus:       'Focus',
  short_break: 'Short Break',
  long_break:  'Long Break',
};

/**
 * Global timer engine — must be mounted once at the layout level.
 * Handles the tick interval and auto-complete regardless of which page is active.
 */
export function useTimerEngine() {
  const {
    sessionId, phase, secondsRemaining, isRunning, durationMinutes, pomodoroCount,
    tick, pause, startBreak, resetToFocus, incrementPomodoro,
  } = useFocusStore();

  const { addToast } = useUIStore();
  const qc = useQueryClient();

  const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const didCompleteRef = useRef(false);

  // Reset completion guard on new session/phase
  useEffect(() => { didCompleteRef.current = false; }, [sessionId, phase]);

  // Tick every second while running
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, tick]);

  // Auto-complete when timer reaches 0
  useEffect(() => {
    if (secondsRemaining === 0 && isRunning && !didCompleteRef.current) {
      didCompleteRef.current = true;
      handleTimerComplete();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsRemaining, isRunning]);

  async function handleTimerComplete() {
    pause();
    playChime();

    if (phase === 'focus') {
      if (sessionId) {
        try {
          await focusApi.complete(sessionId);
          qc.invalidateQueries({ queryKey: [FOCUS_KEY] });
          qc.invalidateQueries({ queryKey: [ANALYTICS_KEY] });
        } catch { /* already ended */ }
      }

      const newCount  = pomodoroCount + 1;
      incrementPomodoro();
      const nextPhase = durationMinutes >= 30 || newCount % 4 === 0 ? 'long_break' : 'short_break';
      const nextLabel = PHASE_LABELS[nextPhase];

      sendNotification('🍅 Focus Complete!', `Nice work! Time for a ${nextLabel}.`);
      addToast({ type: 'success', message: `Focus done! Starting ${nextLabel} (${PHASE_DURATIONS[nextPhase] / 60} min).` });
      startBreak(nextPhase);
    } else {
      sendNotification('⏰ Break Over!', 'Ready for the next focus session?');
      addToast({ type: 'info', message: "Break done! Click Start Focus when you're ready." });
      resetToFocus();
    }
  }
}
