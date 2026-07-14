export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  timezone: string;
  daily_focus_goal_minutes: number;
  email_verified_at: string | null;
  created_at: string;
}

export interface AdminUser extends User {
  is_banned: boolean;
  banned_at: string | null;
  tasks_count: number;
  notes_count: number;
  quizzes_count: number;
  ai_generations_count: number;
}

export interface AdminStats {
  users: { total: number; admins: number; new_today: number; new_week: number };
  tasks: { total: number; completed: number; in_progress: number; overdue: number };
  notes: { total: number; total_words: number };
  ai: { total_generations: number; completed: number; failed: number; summaries: number; quizzes: number; total_tokens: number };
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
  result: SummaryResult | QuizResult | StudyPlanResult | null;
  error_message?: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  created_at: string;
  updated_at: string;
}

export interface SummaryResult {
  summary: string;
  key_points: string[];
}

export interface QuizResult {
  title: string;
  questions: QuizQuestion[];
}

export interface StudyPlanResult {
  plan: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  order_index: number;
}

export type QuizType = 'multiple_choice' | 'true_false' | 'identification' | 'enumeration';

export interface Quiz {
  id: number;
  note_id: number;
  title: string;
  quiz_type: QuizType;
  status: 'draft' | 'available' | 'completed';
  score: number | null;
  attempts_count: number;
  questions: QuizQuestion[];
  created_at: string;
}

export interface QuizSubmitResult {
  score: number;
  correct: number;
  total: number;
  results: QuizQuestionResult[];
}

export interface QuizQuestionResult {
  question_id: number;
  question: string;
  given_answer: string | null;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
}

export type SectionType = 'introduction' | 'activity' | 'discussion' | 'assessment' | 'wrap_up';

export interface LessonPlanSection {
  id: number;
  type: SectionType;
  title: string | null;
  content: string;
  sort_order: number;
}

export interface LessonPlan {
  id: number;
  title: string;
  subject: string;
  grade_level: string;
  description: string | null;
  duration_minutes: number;
  is_published: boolean;
  author?: { id: number; name: string };
  sections?: LessonPlanSection[];
  created_at: string;
  updated_at: string;
}

export interface FocusSession {
  id: number;
  task_id: number | null;
  task?: { id: number; title: string } | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number;
  type: 'pomodoro' | 'freeform';
  completed: boolean;
  notes: string | null;
  created_at: string;
}

export interface AnalyticsOverview {
  tasks_completed: number;
  tasks_total: number;
  focus_sessions_total: number;
  focus_minutes_total: number;
  focus_hours_total: number;
  current_streak: number;
}

export interface FocusByDay {
  date: string;
  minutes: number;
  sessions: number;
}

export interface TaskByDay {
  date: string;
  count: number;
}

export interface HeatmapDay {
  date: string;
  level: 0 | 1 | 2 | 3 | 4;
  minutes: number;
  tasks: number;
}
