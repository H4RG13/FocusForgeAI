'use client';

import type { AnalyticsOverview } from '@/types/domain.types';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}

function StatCard({ label, value, sub, accent = 'bg-indigo-50 text-indigo-700' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${accent.split(' ')[1] ?? 'text-gray-900'}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

interface OverviewStatsProps {
  data: AnalyticsOverview;
}

export default function OverviewStats({ data }: OverviewStatsProps) {
  const completionRate =
    data.tasks_total > 0
      ? Math.round((data.tasks_completed / data.tasks_total) * 100)
      : 0;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <StatCard
        label="Focus Hours"
        value={data.focus_hours_total}
        sub="total completed"
        accent="bg-indigo-50 text-indigo-600"
      />
      <StatCard
        label="Sessions"
        value={data.focus_sessions_total}
        sub="all time"
        accent="bg-purple-50 text-purple-600"
      />
      <StatCard
        label="Streak"
        value={`${data.current_streak}d`}
        sub="current"
        accent="bg-orange-50 text-orange-600"
      />
      <StatCard
        label="Tasks Done"
        value={data.tasks_completed}
        sub={`of ${data.tasks_total} total`}
        accent="bg-emerald-50 text-emerald-600"
      />
      <StatCard
        label="Completion"
        value={`${completionRate}%`}
        sub="task rate"
        accent="bg-sky-50 text-sky-600"
      />
      <StatCard
        label="Focus Min"
        value={data.focus_minutes_total}
        sub="total minutes"
        accent="bg-rose-50 text-rose-600"
      />
    </div>
  );
}
