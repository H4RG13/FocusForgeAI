import apiClient from './client';
import type { Category } from '@/types/domain.types';
import type { ApiResponse, CreateCategoryPayload } from '@/types/api.types';

export const categoriesApi = {
  list: () =>
    apiClient.get<ApiResponse<Category[]>>('/categories'),

  create: (data: CreateCategoryPayload) =>
    apiClient.post<ApiResponse<Category>>('/categories', data),

  update: (id: number, data: Partial<CreateCategoryPayload>) =>
    apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/categories/${id}`),
};
