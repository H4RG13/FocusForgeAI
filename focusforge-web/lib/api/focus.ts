import apiClient from './client';
import type { FocusSession, AnalyticsOverview, FocusByDay, TaskByDay, HeatmapDay } from '@/types/domain.types';
import type { PaginatedResponse } from '@/types/api.types';

export const focusApi = {
  getSessions: (page = 1) =>
    apiClient.get<PaginatedResponse<FocusSession>>('/focus-sessions', { params: { page } }).then(r => r.data),

  startSession: (data: { task_id?: number; duration_minutes?: number; type?: 'pomodoro' | 'freeform'; notes?: string }) =>
    apiClient.post<FocusSession>('/focus-sessions', data).then(r => r.data),

  complete: (id: number) =>
    apiClient.patch<FocusSession>(`/focus-sessions/${id}/complete`).then(r => r.data),

  abandon: (id: number) =>
    apiClient.patch<FocusSession>(`/focus-sessions/${id}/abandon`).then(r => r.data),

  deleteSession: (id: number) =>
    apiClient.delete(`/focus-sessions/${id}`).then(r => r.data),
};

export const analyticsApi = {
  overview: () =>
    apiClient.get<AnalyticsOverview>('/analytics/overview').then(r => r.data),

  focusByDay: (days = 30) =>
    apiClient.get<FocusByDay[]>('/analytics/focus', { params: { days } }).then(r => r.data),

  tasksByDay: (days = 30) =>
    apiClient.get<TaskByDay[]>('/analytics/tasks', { params: { days } }).then(r => r.data),

  heatmap: (weeks = 52) =>
    apiClient.get<HeatmapDay[]>('/analytics/heatmap', { params: { weeks } }).then(r => r.data),
};
