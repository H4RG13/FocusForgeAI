'use client';

import { useState } from 'react';
import {
  useAnalyticsOverview,
  useFocusByDay,
  useTasksByDay,
  useHeatmap,
} from '@/hooks/useFocus';
import OverviewStats from '@/components/features/analytics/OverviewStats';
import FocusChart from '@/components/features/analytics/FocusChart';
import TasksChart from '@/components/features/analytics/TasksChart';
import ActivityHeatmap from '@/components/features/analytics/ActivityHeatmap';
import { Skeleton } from '@/components/shared/LoadingSkeleton';

const RANGE_OPTIONS = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);

  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview();
  const { data: focusData, isLoading: focusLoading } = useFocusByDay(days);
  const { data: tasksData, isLoading: tasksLoading } = useTasksByDay(days);
  const { data: heatmap, isLoading: heatmapLoading } = useHeatmap(52);

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">Your productivity at a glance.</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          {RANGE_OPTIONS.map((o) => (
            <button
              key={o.days}
              onClick={() => setDays(o.days)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                days === o.days
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {overviewLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : overview ? (
        <OverviewStats data={overview} />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {focusLoading ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : focusData ? (
          <FocusChart data={focusData} />
        ) : null}

        {tasksLoading ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : tasksData ? (
          <TasksChart data={tasksData} />
        ) : null}
      </div>

      {heatmapLoading ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : heatmap ? (
        <ActivityHeatmap data={heatmap} />
      ) : null}
    </div>
  );
}
