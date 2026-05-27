'use client';

import { useQuery } from '@tanstack/react-query';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import { ListSkeleton } from '@/components/shared/LoadingSkeleton';
import TaskCard from '@/components/features/tasks/TaskCard';
import { tasksApi } from '@/lib/api/tasks';
import { useAuthStore } from '@/store/auth.store';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: todayTasks, isLoading: loadingToday } = useQuery({
    queryKey: ['tasks', 'today'],
    queryFn: () => tasksApi.today().then((r) => r.data.data),
  });

  const { data: overdueTasks, isLoading: loadingOverdue } = useQuery({
    queryKey: ['tasks', 'overdue'],
    queryFn: () => tasksApi.overdue().then((r) => r.data.data),
  });

  return (
    <div className="flex flex-col">
      <TopBar title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Welcome */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Good day{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
          </h2>
          <p className="text-sm text-gray-500 mt-1">Here's what needs your attention today.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="text-center">
            <p className="text-3xl font-bold text-indigo-600">{todayTasks?.length ?? 0}</p>
            <p className="text-sm text-gray-500 mt-1">Due Today</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-red-500">{overdueTasks?.length ?? 0}</p>
            <p className="text-sm text-gray-500 mt-1">Overdue</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {todayTasks?.filter((t) => t.status === 'done').length ?? 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">Completed Today</p>
          </Card>
        </div>

        {/* Due Today */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Due Today</h3>
          {loadingToday ? (
            <ListSkeleton count={3} />
          ) : todayTasks?.length ? (
            <div className="space-y-2">
              {todayTasks.map((task) => <TaskCard key={task.id} task={task} />)}
            </div>
          ) : (
            <p className="text-sm text-gray-400 rounded-xl border border-dashed border-gray-200 p-6 text-center">
              No tasks due today — enjoy your day!
            </p>
          )}
        </div>

        {/* Overdue */}
        {(overdueTasks?.length ?? 0) > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-red-500">Overdue</h3>
            <div className="space-y-2">
              {overdueTasks!.map((task) => <TaskCard key={task.id} task={task} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
