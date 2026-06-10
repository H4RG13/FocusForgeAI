'use client';

import { useState, useMemo } from 'react';
import { useFocusSessions, useDeleteSession } from '@/hooks/useFocus';
import type { FocusSession } from '@/types/domain.types';
import Button from '@/components/ui/Button';
import SelectInput from '@/components/ui/SelectInput';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Skeleton } from '@/components/shared/LoadingSkeleton';

type SortKey  = 'newest' | 'oldest' | 'longest' | 'shortest';
type FilterKey = 'all' | 'completed' | 'abandoned' | 'pomodoro' | 'freeform';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest',   label: 'Newest first'  },
  { value: 'oldest',   label: 'Oldest first'  },
  { value: 'longest',  label: 'Longest first' },
  { value: 'shortest', label: 'Shortest first'},
];

const FILTER_OPTIONS: { value: FilterKey; label: string }[] = [
  { value: 'all',       label: 'All'       },
  { value: 'completed', label: 'Completed' },
  { value: 'abandoned', label: 'Abandoned' },
  { value: 'pomodoro',  label: 'Pomodoro'  },
  { value: 'freeform',  label: 'Freeform'  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function SessionRow({ session }: { session: FocusSession }) {
  const deleteMutation = useDeleteSession();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => { deleteMutation.mutate(session.id); setConfirmOpen(false); }}
        title="Delete Session"
        message={`Delete this ${session.duration_minutes ?? 0}-min ${session.type} session? This cannot be undone.`}
        loading={deleteMutation.isPending}
      />

      <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/50">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          session.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
        }`}>
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
          variant="ghost" size="sm"
          onClick={() => setConfirmOpen(true)}
          loading={deleteMutation.isPending}
          className="shrink-0 text-red-500 hover:text-red-700"
        >
          ×
        </Button>
      </div>
    </>
  );
}

export default function SessionHistory() {
  const [page,   setPage]   = useState(1);
  const [sort,   setSort]   = useState<SortKey>('newest');
  const [filter, setFilter] = useState<FilterKey>('all');

  const { data, isLoading } = useFocusSessions(page);

  const sessions = useMemo(() => {
    let list = data?.data ?? [];

    // filter
    if (filter === 'completed') list = list.filter(s => s.completed);
    if (filter === 'abandoned')  list = list.filter(s => !s.completed);
    if (filter === 'pomodoro')   list = list.filter(s => s.type === 'pomodoro');
    if (filter === 'freeform')   list = list.filter(s => s.type === 'freeform');

    // sort
    return [...list].sort((a, b) => {
      if (sort === 'newest')   return new Date(b.started_at).getTime() - new Date(a.started_at).getTime();
      if (sort === 'oldest')   return new Date(a.started_at).getTime() - new Date(b.started_at).getTime();
      if (sort === 'longest')  return (b.duration_minutes ?? 0) - (a.duration_minutes ?? 0);
      if (sort === 'shortest') return (a.duration_minutes ?? 0) - (b.duration_minutes ?? 0);
      return 0;
    });
  }, [data, sort, filter]);

  const meta      = data?.meta;
  const lastPage  = meta?.last_page ?? 1;
  const total     = meta?.total ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <SelectInput
          value={filter}
          onChange={(v) => { setFilter(v as FilterKey); setPage(1); }}
          options={FILTER_OPTIONS}
          className="w-36"
        />
        <SelectInput
          value={sort}
          onChange={(v) => setSort(v as SortKey)}
          options={SORT_OPTIONS}
          className="w-40"
        />
        {total > 0 && (
          <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">{total} total</span>
        )}
      </div>

      {/* List */}
      {sessions.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">
          {filter === 'all' ? 'No sessions yet. Start your first focus session above.' : 'No sessions match this filter.'}
        </p>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => <SessionRow key={s.id} session={s} />)}
        </div>
      )}

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            ← Prev
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Page {page} of {lastPage}
          </span>
          <button
            onClick={() => setPage(p => Math.min(lastPage, p + 1))}
            disabled={page === lastPage}
            className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
