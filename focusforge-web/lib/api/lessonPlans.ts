import apiClient from './client';
import type { LessonPlan } from '@/types/domain.types';
import type { PaginatedResponse } from '@/types/api.types';

export interface LessonPlanPayload {
  title: string;
  subject: string;
  grade_level: string;
  description?: string;
  duration_minutes?: number;
  sections?: { type: string; content: string; sort_order: number }[];
}

export const lessonPlanApi = {
  list: (params?: { search?: string; subject?: string; grade_level?: string; page?: number }) =>
    apiClient.get<PaginatedResponse<LessonPlan>>('/lesson-plans', { params }).then(r => r.data),

  get: (id: number) =>
    apiClient.get<{ data: LessonPlan }>(`/lesson-plans/${id}`).then(r => r.data.data),

  create: (payload: LessonPlanPayload) =>
    apiClient.post<{ data: LessonPlan }>('/lesson-plans', payload).then(r => r.data.data),

  update: (id: number, payload: Partial<LessonPlanPayload>) =>
    apiClient.put<{ data: LessonPlan }>(`/lesson-plans/${id}`, payload).then(r => r.data.data),

  destroy: (id: number) =>
    apiClient.delete(`/lesson-plans/${id}`).then(r => r.data),

  publish: (id: number) =>
    apiClient.patch(`/lesson-plans/${id}/publish`).then(r => r.data),

  unpublish: (id: number) =>
    apiClient.patch(`/lesson-plans/${id}/unpublish`).then(r => r.data),
};
