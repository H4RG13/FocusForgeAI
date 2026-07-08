import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi, TaskListParams } from '@/lib/api/tasks';
import { useUIStore } from '@/store/ui.store';
import type { CreateTaskPayload, UpdateTaskPayload } from '@/types/api.types';

export const TASKS_KEY = 'tasks';

export function useTasks(params?: TaskListParams) {
  return useQuery({
    queryKey: [TASKS_KEY, params],
    queryFn: () => tasksApi.list(params).then((r) => r.data),
  });
}

export function useTask(id: number) {
  return useQuery({
    queryKey: [TASKS_KEY, id],
    queryFn: () => tasksApi.get(id).then((r) => r.data.data),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (data: CreateTaskPayload) => tasksApi.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] });
      addToast({ type: 'success', message: 'Task created.' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to create task.' }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskPayload }) =>
      tasksApi.update(id, data).then((r) => r.data.data),

    onMutate: async ({ id, data }) => {
      addToast({ type: 'success', message: 'Task updated.' });

      // Cancel any in-flight refetches so they don't overwrite the optimistic update
      await qc.cancelQueries({ queryKey: [TASKS_KEY] });

      // Snapshot every tasks query so we can roll back on error
      const snapshots = qc.getQueriesData<unknown>({ queryKey: [TASKS_KEY] });

      // Patch every cached entry that contains this task
      qc.setQueriesData<unknown>({ queryKey: [TASKS_KEY] }, (old: unknown) => {
        if (!old) return old;
        // Plain Task[] (dashboard today / overdue)
        if (Array.isArray(old)) {
          return old.map((t: { id: number }) => t.id === id ? { ...t, ...data } : t);
        }
        // Paginated { data: Task[] } (tasks list page)
        if (typeof old === 'object' && old !== null && Array.isArray((old as { data?: unknown }).data)) {
          const paged = old as { data: { id: number }[] };
          return { ...paged, data: paged.data.map((t) => t.id === id ? { ...t, ...data } : t) };
        }
        // Single task object (task detail page)
        if (typeof old === 'object' && old !== null && (old as { id?: number }).id === id) {
          return { ...old, ...data };
        }
        return old;
      });

      return { snapshots };
    },

    onError: (_err, _vars, context) => {
      // Roll back all queries to their pre-mutation snapshots
      if (context?.snapshots) {
        for (const [key, value] of context.snapshots) {
          qc.setQueryData(key, value);
        }
      }
      addToast({ type: 'error', message: 'Failed to update task.' });
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] });
    },
  });
}

export function useCompleteTask() {
  const qc = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (id: number) => tasksApi.complete(id).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] });
      addToast({ type: 'success', message: 'Task completed!' });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (id: number) => tasksApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] });
      addToast({ type: 'success', message: 'Task deleted.' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to delete task.' }),
  });
}
