import apiClient from './client';
import type { Task } from '@/types/domain.types';
import type { ApiResponse, PaginatedResponse, CreateTaskPayload, UpdateTaskPayload } from '@/types/api.types';

export interface TaskListParams {
  status?: string;
  priority?: string;
  category_id?: number;
  due_before?: string;
  page?: number;
  per_page?: number;
}

export const tasksApi = {
  list: (params?: TaskListParams) =>
    apiClient.get<PaginatedResponse<Task>>('/tasks', { params }),

  today: () =>
    apiClient.get<ApiResponse<Task[]>>('/tasks/today'),

  overdue: () =>
    apiClient.get<ApiResponse<Task[]>>('/tasks/overdue'),

  get: (id: number) =>
    apiClient.get<ApiResponse<Task>>(`/tasks/${id}`),

  create: (data: CreateTaskPayload) =>
    apiClient.post<ApiResponse<Task>>('/tasks', data),

  update: (id: number, data: UpdateTaskPayload) =>
    apiClient.put<ApiResponse<Task>>(`/tasks/${id}`, data),

  complete: (id: number) =>
    apiClient.patch<ApiResponse<Task>>(`/tasks/${id}/complete`),

  delete: (id: number) =>
    apiClient.delete(`/tasks/${id}`),
};
