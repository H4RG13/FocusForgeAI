'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { Skeleton } from '@/components/shared/LoadingSkeleton';

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  accent: string;
  icon: string;
}

function StatCard({ label, value, sub, accent, icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-gray-500">{label}</p>
          <p className={`mt-1.5 text-3xl font-bold ${accent}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {sub && <p className="mt-0.5 text-xs text-slate-400 dark:text-gray-500">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-500">
      <span className="h-px flex-1 bg-slate-200 dark:bg-gray-700" />
      <span>{children}</span>
      <span className="h-px flex-1 bg-slate-200 dark:bg-gray-700" />
    </h2>
  );
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStats,
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">System-wide overview</p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-gray-100">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">System-wide overview</p>
      </div>

      <section className="space-y-4">
        <SectionTitle>Users</SectionTitle>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Users"   value={stats.users.total}     icon="👥" accent="text-indigo-600" />
          <StatCard label="Admins"        value={stats.users.admins}    icon="🛡️" accent="text-purple-600" />
          <StatCard label="New Today"     value={stats.users.new_today} icon="✨" accent="text-emerald-600" />
          <StatCard label="New This Week" value={stats.users.new_week}  icon="📈" accent="text-sky-600" />
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>Tasks</SectionTitle>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Tasks"  value={stats.tasks.total}       icon="📋" accent="text-slate-700" />
          <StatCard label="Completed"    value={stats.tasks.completed}   icon="✅" accent="text-emerald-600" />
          <StatCard label="In Progress"  value={stats.tasks.in_progress} icon="⚡" accent="text-amber-600" />
          <StatCard label="Overdue"      value={stats.tasks.overdue}     icon="🔴" accent="text-red-600" />
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>Notes</SectionTitle>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Notes"  value={stats.notes.total}                      icon="📝" accent="text-violet-600" />
          <StatCard label="Total Words"  value={stats.notes.total_words.toLocaleString()} icon="💬" accent="text-blue-600" />
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>AI Generations</SectionTitle>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard label="Total Generations" value={stats.ai.total_generations}           icon="🤖" accent="text-slate-700" />
          <StatCard label="Summaries"          value={stats.ai.summaries}                   icon="📄" accent="text-indigo-600" />
          <StatCard label="Quizzes"            value={stats.ai.quizzes}                     icon="🧠" accent="text-purple-600" />
          <StatCard label="Completed"          value={stats.ai.completed}                   icon="✅" accent="text-emerald-600" />
          <StatCard label="Failed"             value={stats.ai.failed}                      icon="⚠️" accent="text-red-600" />
          <StatCard label="Tokens Used"        value={stats.ai.total_tokens.toLocaleString()} icon="⚙️" accent="text-sky-600" sub="total" />
        </div>
      </section>
    </div>
  );
}
