'use client';

import { useEffect, useRef } from 'react';
import { useFocusStore, TimerPhase } from '@/store/focus.store';
import { useStartSession, useCompleteSession, useAbandonSession } from '@/hooks/useFocus';
import Button from '@/components/ui/Button';

const PHASE_LABELS: Record<TimerPhase, string> = {
  focus: 'Focus',
  short_break: 'Short Break',
  long_break: 'Long Break',
};

const PHASE_COLORS: Record<TimerPhase, string> = {
  focus: 'text-indigo-600',
  short_break: 'text-emerald-600',
  long_break: 'text-blue-600',
};

const PHASE_RING_COLORS: Record<TimerPhase, string> = {
  focus: '#4f46e5',
  short_break: '#059669',
  long_break: '#2563eb',
};

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatTime(seconds: number) {
  return `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
}

const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface PomodoroTimerProps {
  taskId?: number;
}

export default function PomodoroTimer({ taskId }: PomodoroTimerProps) {
  const { sessionId, phase, secondsRemaining, isRunning, durationMinutes, pause, resume } =
    useFocusStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tick = useFocusStore((s) => s.tick);

  const startMutation = useStartSession();
  const completeMutation = useCompleteSession();
  const abandonMutation = useAbandonSession();

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, tick]);

  const totalSeconds = durationMinutes * 60;
  const progress = totalSeconds > 0 ? secondsRemaining / totalSeconds : 1;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const hasSession = sessionId !== null;

  function handleStart() {
    startMutation.mutate({ task_id: taskId, duration_minutes: 25, type: 'pomodoro' });
  }

  function handleComplete() {
    if (sessionId) completeMutation.mutate(sessionId);
  }

  function handleAbandon() {
    if (sessionId) abandonMutation.mutate(sessionId);
  }

  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      {/* Phase label */}
      <div className="flex gap-2">
        {(['focus', 'short_break', 'long_break'] as TimerPhase[]).map((p) => (
          <span
            key={p}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              phase === p
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {PHASE_LABELS[p]}
          </span>
        ))}
      </div>

      {/* SVG ring */}
      <div className="relative flex items-center justify-center">
        <svg width="200" height="200" className="-rotate-90">
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke={PHASE_RING_COLORS[phase]}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={`text-5xl font-bold tabular-nums ${PHASE_COLORS[phase]}`}>
            {formatTime(secondsRemaining)}
          </span>
          <span className="mt-1 text-sm text-gray-400">{PHASE_LABELS[phase]}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!hasSession ? (
          <Button onClick={handleStart} loading={startMutation.isPending} size="lg">
            Start Focus
          </Button>
        ) : (
          <>
            {isRunning ? (
              <Button variant="secondary" onClick={pause} size="lg">
                Pause
              </Button>
            ) : (
              <Button onClick={resume} size="lg">
                Resume
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleComplete}
              loading={completeMutation.isPending}
              size="lg"
            >
              Complete
            </Button>
            <Button
              variant="ghost"
              onClick={handleAbandon}
              loading={abandonMutation.isPending}
              size="lg"
            >
              Abandon
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
