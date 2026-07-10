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

  exportJson: async (id: number, filename: string): Promise<void> => {
    const res = await apiClient.get(`/lesson-plans/${id}/export/json`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/json' }));
    const a   = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  exportDocx: async (id: number, filename: string): Promise<void> => {
    const res = await apiClient.get(`/lesson-plans/${id}/export/docx`, { responseType: 'blob' });
    const url = URL.createObjectURL(
      new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    );
    const a   = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importFile: (file: File): Promise<Partial<LessonPlan>> => {
    const form = new FormData();
    form.append('file', file);
    return apiClient
      .post<{ data: Partial<LessonPlan> }>('/lesson-plans/import', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(r => r.data.data);
  },
};
