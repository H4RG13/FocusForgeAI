'use client';

import { useEffect, useRef, useState } from 'react';
import { Task } from '@/types/domain.types';
import Badge from '@/components/ui/Badge';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { PRIORITY_COLORS, STATUS_COLORS, formatDate } from '@/lib/utils/format';
import { useCompleteTask, useDeleteTask, useUpdateTask } from '@/hooks/useTasks';

const STATUS_OPTIONS = [
  { value: 'todo',        label: 'To Do'       },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done',        label: 'Done'        },
  { value: 'archived',    label: 'Archived'    },
] as const;

type StatusValue = typeof STATUS_OPTIONS[number]['value'];

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
}

export default function TaskCard({ task, onEdit }: TaskCardProps) {
  const completeTask = useCompleteTask();
  const deleteTask   = useDeleteTask();
  const updateTask   = useUpdateTask();
  const [confirmOpen,      setConfirmOpen]      = useState(false);
  const [statusPickerOpen, setStatusPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker on outside click
  useEffect(() => {
    if (!statusPickerOpen) return;
    function onOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setStatusPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [statusPickerOpen]);

  function handleStatusSelect(status: StatusValue) {
    setStatusPickerOpen(false);
    if (status === task.status) return;
    updateTask.mutate({ id: task.id, data: { status } });
  }

  return (
    <>
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => { deleteTask.mutate(task.id); setConfirmOpen(false); }}
        title="Delete Task"
        message={`Delete "${task.title}"? This cannot be undone.`}
        loading={deleteTask.isPending}
      />

      <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
        {/* Complete checkbox */}
        <button
          onClick={() => task.status !== 'done' && completeTask.mutate(task.id)}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            task.status === 'done'
              ? 'border-green-500 bg-green-500 text-white'
              : 'border-gray-300 hover:border-indigo-500 dark:border-gray-600'
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
          <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="mt-0.5 text-xs text-gray-500 line-clamp-1 dark:text-gray-400">{task.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge color={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>

            {/* Clickable status badge with inline picker */}
            <div ref={pickerRef} className="relative">
              <button
                onClick={() => setStatusPickerOpen((v) => !v)}
                className="focus:outline-none"
                title="Change status"
              >
                <Badge color={STATUS_COLORS[task.status]} className="cursor-pointer hover:opacity-80 transition-opacity">
                  {task.status.replace('_', ' ')}
                  <span className="ml-1 opacity-60">▾</span>
                </Badge>
              </button>

              {statusPickerOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 min-w-[130px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleStatusSelect(opt.value)}
                      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        task.status === opt.value ? 'font-semibold' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[opt.value] }}
                      />
                      {opt.label}
                      {task.status === opt.value && <span className="ml-auto text-indigo-500">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              ✎
            </button>
          )}
          <button
            onClick={() => setConfirmOpen(true)}
            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
          >
            ✕
          </button>
        </div>
      </div>
    </>
  );
}
