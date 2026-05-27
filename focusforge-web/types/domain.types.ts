export interface User {
  id: number;
  name: string;
  email: string;
  timezone: string;
  daily_focus_goal_minutes: number;
  email_verified_at: string | null;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string | null;
  created_at: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  completed_at: string | null;
  category: Category | null;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: number;
  title: string;
  content: string | null;
  word_count: number;
  file_path: string | null;
  file_type: string | null;
  category: Category | null;
  created_at: string;
  updated_at: string;
}

export interface AIGeneration {
  id: number;
  type: 'summary' | 'quiz' | 'study_plan' | 'chat';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result: Record<string, unknown> | null;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  created_at: string;
}

export interface FocusSession {
  id: number;
  task_id: number | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number;
  type: 'pomodoro' | 'freeform';
  completed: boolean;
  notes: string | null;
  created_at: string;
}
