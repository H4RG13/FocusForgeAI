'use client';

import { useEffect, useRef } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { sendNotification } from '@/lib/utils/sound';

// Notify at these many minutes before the deadline
const THRESHOLDS = [30, 10];

export function useTaskDeadlineNotifier() {
  const { data: taskData } = useTasks();
  // Track which (taskId + threshold) combos have already been notified this session
  const notified = useRef<Set<string>>(new Set());

  useEffect(() => {
    function check() {
      const tasks = (taskData as { data?: { id: number; title: string; due_date: string | null; status: string }[] } | undefined)?.data;
      if (!tasks) return;

      const now = Date.now();

      for (const task of tasks) {
        if (!task.due_date) continue;
        if (task.status === 'done' || task.status === 'archived') continue;

        const due     = new Date(task.due_date).getTime();
        const diffMin = (due - now) / 60_000;

        // Threshold notifications (30 min, 10 min before)
        for (const t of THRESHOLDS) {
          const key = `${task.id}-${t}`;
          if (diffMin <= t && diffMin > t - 2 && !notified.current.has(key)) {
            notified.current.add(key);
            const timeStr = new Date(task.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            sendNotification(`⏰ Task due in ${t} min`, `"${task.title}" is due at ${timeStr}`);
          }
        }

        // Just-overdue notification
        const overdueKey = `${task.id}-overdue`;
        if (diffMin <= 0 && diffMin > -2 && !notified.current.has(overdueKey)) {
          notified.current.add(overdueKey);
          sendNotification('🔴 Task Overdue', `"${task.title}" deadline has passed.`);
        }
      }
    }

    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [taskData]);
}
