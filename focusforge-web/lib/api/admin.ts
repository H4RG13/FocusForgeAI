import apiClient from './client';
import type { AdminStats, AdminUser } from '@/types/domain.types';
import type { PaginatedResponse } from '@/types/api.types';

export const adminApi = {
  getStats: () =>
    apiClient.get<AdminStats>('/admin/stats').then(r => r.data),

  getUsers: (params?: { search?: string; role?: string; page?: number }) =>
    apiClient.get<PaginatedResponse<AdminUser>>('/admin/users', { params }).then(r => r.data),

  getUser: (id: number) =>
    apiClient.get<AdminUser>(`/admin/users/${id}`).then(r => r.data),

  promoteUser: (id: number) =>
    apiClient.patch(`/admin/users/${id}/promote`).then(r => r.data),

  demoteUser: (id: number) =>
    apiClient.patch(`/admin/users/${id}/demote`).then(r => r.data),

  banUser: (id: number) =>
    apiClient.patch(`/admin/users/${id}/ban`).then(r => r.data),

  unbanUser: (id: number) =>
    apiClient.patch(`/admin/users/${id}/unban`).then(r => r.data),

  deleteUser: (id: number) =>
    apiClient.delete(`/admin/users/${id}`).then(r => r.data),
};
