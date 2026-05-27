import { Task, Note, Category, User } from './domain.types';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface AuthResponse {
  data: User;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  timezone?: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  due_date?: string;
  category_id?: number | null;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {}

export interface CreateNotePayload {
  title: string;
  content?: string;
  category_id?: number | null;
}

export interface UpdateNotePayload extends Partial<CreateNotePayload> {}

export interface CreateCategoryPayload {
  name: string;
  color?: string;
  icon?: string;
}
