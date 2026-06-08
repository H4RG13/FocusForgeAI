'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import { useTask, useCompleteTask } from '@/hooks/useTasks';
import { PRIORITY_COLORS, STATUS_COLORS, formatDate } from '@/lib/utils/format';
import { ROUTES } from '@/lib/constants/routes';

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const taskId = parseInt(id, 10);
  const router = useRouter();
  const { data: task, isLoading } = useTask(taskId);
  const completeTask = useCompleteTask();

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <TopBar title="Task" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col">
        <TopBar title="Task" />
        <div className="p-6 text-center text-gray-500">Task not found.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <TopBar title="Task Detail" />
      <div className="mx-auto w-full max-w-2xl p-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.TASKS)}>
          ← Back to Tasks
        </Button>

        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h1 className={`text-xl font-semibold ${task.status === 'done' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
              {task.title}
            </h1>
            {task.status !== 'done' && (
              <Button
                size="sm"
                variant="secondary"
                loading={completeTask.isPending}
                onClick={() => completeTask.mutate(task.id)}
              >
                Mark Done
              </Button>
            )}
          </div>

          {task.description && (
            <p className="text-sm text-gray-600 leading-relaxed dark:text-gray-400">{task.description}</p>
          )}

          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <Badge color={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
            <Badge color={STATUS_COLORS[task.status]}>{task.status.replace('_', ' ')}</Badge>
            {task.category && (
              <Badge style={{ backgroundColor: task.category.color + '20', color: task.category.color }}>
                {task.category.name}
              </Badge>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-400 text-xs uppercase tracking-wide dark:text-gray-500">Due Date</dt>
              <dd className="mt-0.5 font-medium text-gray-700 dark:text-gray-300">{formatDate(task.due_date)}</dd>
            </div>
            <div>
              <dt className="text-gray-400 text-xs uppercase tracking-wide dark:text-gray-500">Created</dt>
              <dd className="mt-0.5 font-medium text-gray-700 dark:text-gray-300">{formatDate(task.created_at)}</dd>
            </div>
            {task.completed_at && (
              <div>
                <dt className="text-gray-400 text-xs uppercase tracking-wide">Completed</dt>
                <dd className="mt-0.5 font-medium text-green-700">{formatDate(task.completed_at)}</dd>
              </div>
            )}
          </dl>
        </Card>
      </div>
    </div>
  );
}
