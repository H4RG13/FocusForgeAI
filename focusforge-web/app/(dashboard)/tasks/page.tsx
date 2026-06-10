'use client';

import { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import TaskCard from '@/components/features/tasks/TaskCard';
import TaskForm from '@/components/features/tasks/TaskForm';
import EmptyState from '@/components/shared/EmptyState';
import { ListSkeleton } from '@/components/shared/LoadingSkeleton';
import { useTasks, useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import type { Task } from '@/types/domain.types';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export default function TasksPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const { data, isLoading } = useTasks({ status: statusFilter || undefined });
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const handleCreate = async (formData: any) => {
    await createTask.mutateAsync(formData);
    setShowCreate(false);
  };

  const handleUpdate = async (formData: any) => {
    if (!editTask) return;
    await updateTask.mutateAsync({ id: editTask.id, data: formData });
    setEditTask(null);
  };

  return (
    <div className="flex flex-col">
      <TopBar title="Tasks" />
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  statusFilter === f.value
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Button onClick={() => setShowCreate(true)} size="sm">
            + New Task
          </Button>
        </div>

        {/* Task list */}
        {isLoading ? (
          <ListSkeleton count={4} />
        ) : data?.data.length ? (
          <div className="space-y-2">
            {data.data.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={setEditTask} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No tasks yet"
            description="Create your first task to get started."
            action={<Button onClick={() => setShowCreate(true)} size="sm">+ New Task</Button>}
          />
        )}
      </div>

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Task">
        <TaskForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          loading={createTask.isPending}
        />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editTask} onClose={() => setEditTask(null)} title="Edit Task">
        {editTask && (
          <TaskForm
            defaultValues={editTask}
            onSubmit={handleUpdate}
            onCancel={() => setEditTask(null)}
            loading={updateTask.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
