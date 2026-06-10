'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useFocusStore, PHASE_DURATIONS } from '@/store/focus.store';
import { useTimerEngine } from '@/hooks/useTimerEngine';
import { ROUTES } from '@/lib/constants/routes';

function pad(n: number) { return String(n).padStart(2, '0'); }
function formatTime(s: number) { return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }

const PHASE_COLOR: Record<string, string> = {
  focus:       'text-indigo-400',
  short_break: 'text-emerald-400',
  long_break:  'text-blue-400',
};
const PHASE_RING: Record<string, string> = {
  focus:       '#6366f1',
  short_break: '#10b981',
  long_break:  '#3b82f6',
};
const PHASE_LABEL: Record<string, string> = {
  focus:       'Focus',
  short_break: 'Short Break',
  long_break:  'Long Break',
};

const RADIUS = 22;
const CIRC   = 2 * Math.PI * RADIUS;

export default function FloatingTimer() {
  useTimerEngine();

  const pathname = usePathname();
  const router   = useRouter();

  const { phase, secondsRemaining, isRunning, durationMinutes, sessionId, pause, resume } = useFocusStore();

  const isOnFocusPage    = pathname === ROUTES.FOCUS || pathname?.startsWith(ROUTES.FOCUS + '/');
  const hasActiveSession = sessionId !== null || isRunning;
  const visible          = hasActiveSession && !isOnFocusPage;

  const [pos,       setPos]      = useState({ x: 16, y: 600 });
  const [dragging,  setDragging] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const dragOrigin = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  // Snap to bottom-left on mount
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    setPos({
      x: isMobile ? 12 : 24,
      y: window.innerHeight - (isMobile ? 120 : 160),
    });
  }, []);

  // Mouse + touch drag listeners
  useEffect(() => {
    if (!dragging) return;

    function move(cx: number, cy: number) {
      const dx = cx - dragOrigin.current.mx;
      const dy = cy - dragOrigin.current.my;
      // clamp to viewport
      const newX = Math.max(0, Math.min(window.innerWidth  - 180, dragOrigin.current.px + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - 60,  dragOrigin.current.py + dy));
      setPos({ x: newX, y: newY });
    }

    function onMouseMove(e: MouseEvent)  { move(e.clientX, e.clientY); }
    function onTouchMove(e: TouchEvent)  { e.preventDefault(); move(e.touches[0].clientX, e.touches[0].clientY); }
    function onUp()                       { setDragging(false); }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend',  onUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend',  onUp);
    };
  }, [dragging]);

  function startDrag(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    const point = 'touches' in e ? e.touches[0] : e;
    dragOrigin.current = { mx: point.clientX, my: point.clientY, px: pos.x, py: pos.y };
    setDragging(true);
  }

  if (!visible) return null;

  const totalSeconds     = phase === 'focus' ? durationMinutes * 60 : PHASE_DURATIONS[phase];
  const progress         = totalSeconds > 0 ? secondsRemaining / totalSeconds : 1;
  const strokeDashoffset = CIRC * (1 - progress);

  return (
    <div
      style={{ left: pos.x, top: pos.y, zIndex: 60 }}
      className="fixed select-none"
    >
      <div className="rounded-2xl border border-gray-700 bg-gray-900/95 shadow-2xl text-white overflow-hidden backdrop-blur-sm"
           style={{ width: 'clamp(160px, 44vw, 208px)' }}>

        {/* Drag handle */}
        <div
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          className="flex items-center justify-between px-2.5 py-1.5 bg-gray-800 cursor-grab active:cursor-grabbing touch-none"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs">⏱</span>
            <span className="text-xs font-semibold text-gray-300 hidden sm:inline">Focus Timer</span>
            <span className="text-xs font-semibold text-gray-300 sm:hidden">Timer</span>
          </div>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={() => setMinimized(m => !m)}
            className="rounded p-0.5 text-gray-400 hover:bg-gray-700 hover:text-gray-200 transition-colors"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {minimized
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              }
            </svg>
          </button>
        </div>

        {/* Expanded body */}
        {!minimized && (
          <div className="flex flex-col items-center gap-2 px-3 py-3">
            {/* Ring + time */}
            <div className="relative flex items-center justify-center">
              <svg width="60" height="60" className="-rotate-90">
                <circle cx="30" cy="30" r={RADIUS} fill="none" stroke="#374151" strokeWidth="3.5" />
                <circle
                  cx="30" cy="30" r={RADIUS} fill="none"
                  stroke={PHASE_RING[phase]} strokeWidth="3.5" strokeLinecap="round"
                  strokeDasharray={CIRC} strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000"
                />
              </svg>
              <span className={`absolute text-sm font-bold tabular-nums ${PHASE_COLOR[phase]}`}>
                {formatTime(secondsRemaining)}
              </span>
            </div>

            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
              {PHASE_LABEL[phase]}
            </p>

            {/* Controls */}
            <div className="flex items-center gap-1.5 w-full">
              <button
                onClick={isRunning ? pause : resume}
                className="flex-1 rounded-lg bg-indigo-600 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-500 active:bg-indigo-700 transition-colors"
              >
                {isRunning ? '⏸ Pause' : '▶ Resume'}
              </button>
              <button
                onClick={() => router.push(ROUTES.FOCUS)}
                className="rounded-lg border border-gray-600 px-2 py-1.5 text-[11px] text-gray-400 hover:border-gray-400 hover:text-gray-200 transition-colors"
                aria-label="Go to focus page"
              >
                ↗
              </button>
            </div>
          </div>
        )}

        {/* Minimized pill */}
        {minimized && (
          <div className="flex items-center justify-between px-2.5 py-1.5 gap-2">
            <span className={`text-xs font-bold tabular-nums ${PHASE_COLOR[phase]}`}>
              {formatTime(secondsRemaining)}
            </span>
            <button
              onClick={isRunning ? pause : resume}
              className="rounded px-1.5 py-0.5 bg-indigo-600 text-[10px] font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              {isRunning ? '⏸' : '▶'}
            </button>
            <button
              onClick={() => router.push(ROUTES.FOCUS)}
              className="text-[11px] text-gray-400 hover:text-gray-200 transition-colors"
            >
              ↗
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
