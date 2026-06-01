import apiClient from './client';
import type { AuthResponse, LoginPayload, RegisterPayload } from '@/types/api.types';
import type { ApiResponse } from '@/types/api.types';
import type { User } from '@/types/domain.types';

export const authApi = {
  register: (data: RegisterPayload) =>
    apiClient.post<AuthResponse>('/auth/register', data),

  login: (data: LoginPayload) =>
    apiClient.post<AuthResponse>('/auth/login', data),

  logout: () =>
    apiClient.post('/auth/logout'),

  me: () =>
    apiClient.get<ApiResponse<User>>('/auth/me'),

  updateProfile: (data: Partial<Pick<User, 'name' | 'timezone' | 'daily_focus_goal_minutes'>>) =>
    apiClient.put<ApiResponse<User>>('/auth/me', data),

  forgotPassword: (email: string) =>
    apiClient.post<{ message: string }>('/auth/forgot-password', { email }),

  resetPassword: (data: { token: string; email: string; password: string; password_confirmation: string }) =>
    apiClient.post<{ message: string }>('/auth/reset-password', data),
};
