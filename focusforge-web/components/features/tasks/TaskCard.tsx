'use client';

import { Task } from '@/types/domain.types';
import Badge from '@/components/ui/Badge';
import { PRIORITY_COLORS, STATUS_COLORS, formatDate } from '@/lib/utils/format';
import { useCompleteTask, useDeleteTask } from '@/hooks/useTasks';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
}

export default function TaskCard({ task, onEdit }: TaskCardProps) {
  const completeTask = useCompleteTask();
  const deleteTask = useDeleteTask();

  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Complete checkbox */}
      <button
        onClick={() => task.status !== 'done' && completeTask.mutate(task.id)}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          task.status === 'done'
            ? 'border-green-500 bg-green-500 text-white'
            : 'border-gray-300 hover:border-indigo-500'
        }`}
      >
        {task.status === 'done' && (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{task.description}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge color={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
          <Badge color={STATUS_COLORS[task.status]}>{task.status.replace('_', ' ')}</Badge>
          {task.category && (
            <Badge style={{ backgroundColor: task.category.color + '20', color: task.category.color }}>
              {task.category.name}
            </Badge>
          )}
          {task.due_date && (
            <span className="text-xs text-gray-500">Due {formatDate(task.due_date)}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        {onEdit && (
          <button
            onClick={() => onEdit(task)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✎
          </button>
        )}
        <button
          onClick={() => deleteTask.mutate(task.id)}
          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
