import apiClient from './client';
import type { Note } from '@/types/domain.types';
import type { ApiResponse, PaginatedResponse, CreateNotePayload, UpdateNotePayload } from '@/types/api.types';

export interface NoteListParams {
  category_id?: number;
  search?: string;
  page?: number;
  per_page?: number;
}

export const notesApi = {
  list: (params?: NoteListParams) =>
    apiClient.get<PaginatedResponse<Note>>('/notes', { params }),

  get: (id: number) =>
    apiClient.get<ApiResponse<Note>>(`/notes/${id}`),

  create: (data: CreateNotePayload) =>
    apiClient.post<ApiResponse<Note>>('/notes', data),

  update: (id: number, data: UpdateNotePayload) =>
    apiClient.put<ApiResponse<Note>>(`/notes/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/notes/${id}`),
};
