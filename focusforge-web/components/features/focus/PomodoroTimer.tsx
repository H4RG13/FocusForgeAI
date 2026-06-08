'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useFocusStore, TimerPhase, PHASE_DURATIONS } from '@/store/focus.store';
import { useStartSession, useAbandonSession, FOCUS_KEY, ANALYTICS_KEY } from '@/hooks/useFocus';
import { focusApi } from '@/lib/api/focus';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { playChime, sendNotification } from '@/lib/utils/sound';
import Button from '@/components/ui/Button';

const PHASE_LABELS: Record<TimerPhase, string> = {
  focus:       'Focus',
  short_break: 'Short Break',
  long_break:  'Long Break',
};

const PHASE_COLORS: Record<TimerPhase, string> = {
  focus:       'text-indigo-600',
  short_break: 'text-emerald-600',
  long_break:  'text-blue-600',
};

const PHASE_RING: Record<TimerPhase, string> = {
  focus:       '#4f46e5',
  short_break: '#059669',
  long_break:  '#2563eb',
};

const PHASE_TAB_ACTIVE: Record<TimerPhase, string> = {
  focus:       'bg-indigo-100 text-indigo-700',
  short_break: 'bg-emerald-100 text-emerald-700',
  long_break:  'bg-blue-100 text-blue-700',
};

const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function pad(n: number) { return String(n).padStart(2, '0'); }
function formatTime(s: number) { return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }

interface PomodoroTimerProps {
  taskId?: number;
}

export default function PomodoroTimer({ taskId }: PomodoroTimerProps) {
  const store = useFocusStore();
  const {
    sessionId, phase, secondsRemaining, isRunning, durationMinutes, pomodoroCount,
    tick, pause, resume, startBreak, resetToFocus, incrementPomodoro, skipToEnd,
  } = store;

  const { addToast }  = useUIStore();
  const user          = useAuthStore((s) => s.user);
  const qc            = useQueryClient();
  const startMutation = useStartSession();
  const abandonMutation = useAbandonSession();

  const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const didCompleteRef = useRef(false);

  // Reset completion guard whenever a new phase/session starts
  useEffect(() => { didCompleteRef.current = false; }, [sessionId, phase]);

  // Tick interval
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, tick]);

  // Auto-complete when timer hits 0
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
      // Complete the DB session if one exists
      if (sessionId) {
        try {
          await focusApi.complete(sessionId);
          qc.invalidateQueries({ queryKey: [FOCUS_KEY] });
          qc.invalidateQueries({ queryKey: [ANALYTICS_KEY] });
        } catch { /* already ended */ }
      }

      const newCount   = pomodoroCount + 1;
      incrementPomodoro();

      const nextPhase  = newCount % 4 === 0 ? 'long_break' : 'short_break';
      const nextLabel  = PHASE_LABELS[nextPhase];

      sendNotification('🍅 Focus Complete!', `Nice work! Time for a ${nextLabel}.`);
      addToast({ type: 'success', message: `Focus done! Starting ${nextLabel} (${PHASE_DURATIONS[nextPhase] / 60} min).` });
      startBreak(nextPhase);

    } else {
      // Break ended → back to focus
      sendNotification('⏰ Break Over!', 'Ready for the next focus session?');
      addToast({ type: 'info', message: 'Break done! Click Start Focus when you\'re ready.' });
      resetToFocus();
    }
  }

  // Ring progress
  const totalSeconds      = phase === 'focus' ? durationMinutes * 60 : PHASE_DURATIONS[phase];
  const progress          = totalSeconds > 0 ? secondsRemaining / totalSeconds : 1;
  const strokeDashoffset  = CIRCUMFERENCE * (1 - progress);

  const isAdmin    = user?.role === 'admin';
  const hasFocusSession = sessionId !== null;
  const isBreak    = phase !== 'focus';

  function handleTabClick(p: TimerPhase) {
    if (isRunning) return; // can't switch while running
    if (p === 'focus' && hasFocusSession) return; // active focus session
    if (p === 'focus') resetToFocus();
    else startBreak(p as 'short_break' | 'long_break');
    // immediately pause so user can start manually
    pause();
  }

  function handleStartFocus() {
    startMutation.mutate({ task_id: taskId, duration_minutes: 25, type: 'pomodoro' });
  }

  function handleAbandon() {
    if (sessionId) abandonMutation.mutate(sessionId);
    else resetToFocus();
  }

  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900">

      {/* Pomodoro count */}
      <div className="flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500">
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} className={i < (pomodoroCount % 4) || (pomodoroCount > 0 && pomodoroCount % 4 === 0) ? 'text-red-500' : 'text-gray-200'}>
            🍅
          </span>
        ))}
        <span className="ml-2 text-xs">{pomodoroCount} session{pomodoroCount !== 1 ? 's' : ''} done</span>
      </div>

      {/* Phase tabs */}
      <div className="flex gap-2">
        {(['focus', 'short_break', 'long_break'] as TimerPhase[]).map((p) => (
          <button
            key={p}
            onClick={() => handleTabClick(p)}
            disabled={isRunning}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed ${
              phase === p
                ? PHASE_TAB_ACTIVE[p]
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700'
            }`}
          >
            {PHASE_LABELS[p]}
          </button>
        ))}
      </div>

      {/* SVG ring */}
      <div className="relative flex items-center justify-center">
        <svg width="200" height="200" className="-rotate-90">
          <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="100" cy="100" r={RADIUS} fill="none"
            stroke={PHASE_RING[phase]} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE} strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={`text-5xl font-bold tabular-nums ${PHASE_COLORS[phase]}`}>
            {formatTime(secondsRemaining)}
          </span>
          <span className="mt-1 text-sm text-gray-400 dark:text-gray-500">{PHASE_LABELS[phase]}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-3">
        {!hasFocusSession && !isBreak ? (
          /* Ready to start focus */
          <Button onClick={handleStartFocus} loading={startMutation.isPending} size="lg">
            Start Focus
          </Button>
        ) : isBreak ? (
          /* Break running */
          <>
            {isRunning ? (
              <Button variant="secondary" onClick={pause} size="lg">Pause Break</Button>
            ) : (
              <Button onClick={resume} size="lg">Resume Break</Button>
            )}
            <Button variant="ghost" onClick={resetToFocus} size="lg">Skip Break</Button>
          </>
        ) : (
          /* Focus session active */
          <>
            {isRunning ? (
              <Button variant="secondary" onClick={pause} size="lg">Pause</Button>
            ) : (
              <Button onClick={resume} size="lg">Resume</Button>
            )}
            <Button variant="ghost" onClick={handleAbandon} loading={abandonMutation.isPending} size="lg">
              Abandon
            </Button>
          </>
        )}
      </div>

      {/* Admin quick-end button */}
      {isAdmin && isRunning && (
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={skipToEnd}
            className="rounded-lg border border-dashed border-red-300 bg-red-50 px-4 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
          >
            ⚡ Skip to 3s (Admin Test)
          </button>
          <span className="text-xs text-gray-400">Tests notification + sound</span>
        </div>
      )}
    </div>
  );
}
