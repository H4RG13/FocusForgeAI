import apiClient from './client';
import { AIGeneration, Quiz, QuizSubmitResult } from '@/types/domain.types';

export const aiApi = {
  summarize: (noteId: number) =>
    apiClient.post<AIGeneration>(`/notes/${noteId}/summarize`).then(r => r.data),

  generateQuiz: (noteId: number, questionCount = 5, quizType = 'multiple_choice') =>
    apiClient.post<AIGeneration>(`/notes/${noteId}/quiz`, { question_count: questionCount, quiz_type: quizType }).then(r => r.data),

  pollGeneration: (id: number) =>
    apiClient.get<AIGeneration>(`/ai-generations/${id}`).then(r => r.data),

  getQuizzes: (noteId: number) =>
    apiClient.get<Quiz[]>(`/notes/${noteId}/quizzes`).then(r => r.data),

  getQuiz: (quizId: number) =>
    apiClient.get<Quiz>(`/quizzes/${quizId}`).then(r => r.data),

  submitQuiz: (quizId: number, answers: Record<number, string>) =>
    apiClient.post<QuizSubmitResult>(`/quizzes/${quizId}/submit`, { answers }).then(r => r.data),

  deleteQuiz: (quizId: number) =>
    apiClient.delete(`/quizzes/${quizId}`),

  exportQuizzes: (noteId: number, quizIds: number[]) => {
    const params = new URLSearchParams();
    quizIds.forEach((id) => params.append('quiz_ids[]', String(id)));
    return apiClient
      .get<Blob>(`/notes/${noteId}/quizzes/export?${params.toString()}`, { responseType: 'blob' })
      .then((r) => r.data);
  },

  chat: (messages: { role: 'user' | 'assistant'; content: string }[]) =>
    apiClient.post<{ data: { content: string; model: string } }>('/ai/chat', { messages }).then(r => r.data.data),

  generateStudyPlan: (topic: string, context?: string) =>
    apiClient.post<AIGeneration>('/ai/study-plan', { topic, context }).then(r => r.data),
};
