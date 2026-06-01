'use client';

import { useEffect } from 'react';
import { requestNotificationPermission } from '@/lib/utils/sound';
import PomodoroTimer from '@/components/features/focus/PomodoroTimer';
import SessionHistory from '@/components/features/focus/SessionHistory';

export default function FocusPage() {
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Focus Timer</h1>
        <p className="mt-1 text-sm text-gray-500">
          Use the Pomodoro technique to stay in the zone.
        </p>
      </div>

      <PomodoroTimer />

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Session History</h2>
        <SessionHistory />
      </section>
    </div>
  );
}
