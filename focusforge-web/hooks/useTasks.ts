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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] });
      addToast({ type: 'success', message: 'Task updated.' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to update task.' }),
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
