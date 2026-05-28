'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { Skeleton } from '@/components/shared/LoadingSkeleton';

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStats,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Users</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={stats.users.total} />
          <StatCard label="Admins" value={stats.users.admins} />
          <StatCard label="New Today" value={stats.users.new_today} />
          <StatCard label="New This Week" value={stats.users.new_week} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Tasks</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Tasks" value={stats.tasks.total} />
          <StatCard label="Completed" value={stats.tasks.completed} />
          <StatCard label="In Progress" value={stats.tasks.in_progress} />
          <StatCard label="Overdue" value={stats.tasks.overdue} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Notes</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Notes" value={stats.notes.total} />
          <StatCard label="Total Words" value={stats.notes.total_words.toLocaleString()} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">AI</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Total Generations" value={stats.ai.total_generations} />
          <StatCard label="Summaries" value={stats.ai.summaries} />
          <StatCard label="Quizzes Generated" value={stats.ai.quizzes} />
          <StatCard label="Completed" value={stats.ai.completed} />
          <StatCard label="Failed" value={stats.ai.failed} />
          <StatCard label="Total Tokens Used" value={stats.ai.total_tokens.toLocaleString()} />
        </div>
      </section>
    </div>
  );
}
