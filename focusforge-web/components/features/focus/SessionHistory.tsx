'use client';

import { useFocusSessions, useDeleteSession } from '@/hooks/useFocus';
import type { FocusSession } from '@/types/domain.types';
import Button from '@/components/ui/Button';
import { Skeleton } from '@/components/shared/LoadingSkeleton';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function SessionRow({ session }: { session: FocusSession }) {
  const deleteMutation = useDeleteSession();

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/50">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          session.completed
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-red-100 text-red-600'
        }`}
      >
        {session.completed ? '✓' : '✗'}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {session.task?.title ?? 'Free focus'}
          <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
            {session.type}
          </span>
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(session.started_at)}</p>
      </div>
      <span className="shrink-0 text-sm font-semibold text-gray-700 dark:text-gray-300">
        {session.duration_minutes ?? 0} min
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => deleteMutation.mutate(session.id)}
        loading={deleteMutation.isPending}
        className="shrink-0 text-red-500 hover:text-red-700"
      >
        ×
      </Button>
    </div>
  );
}

export default function SessionHistory() {
  const { data, isLoading } = useFocusSessions();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    );
  }

  const sessions = data?.data ?? [];

  if (sessions.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">
        No sessions yet. Start your first focus session above.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {sessions.map((s) => (
        <SessionRow key={s.id} session={s} />
      ))}
    </div>
  );
}
