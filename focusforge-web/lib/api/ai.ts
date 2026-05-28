import apiClient from './client';
import { AIGeneration, Quiz, QuizSubmitResult } from '@/types/domain.types';

export const aiApi = {
  summarize: (noteId: number) =>
    apiClient.post<AIGeneration>(`/notes/${noteId}/summarize`).then(r => r.data),

  generateQuiz: (noteId: number, questionCount = 5) =>
    apiClient.post<AIGeneration>(`/notes/${noteId}/quiz`, { question_count: questionCount }).then(r => r.data),

  pollGeneration: (id: number) =>
    apiClient.get<AIGeneration>(`/ai-generations/${id}`).then(r => r.data),

  getQuizzes: (noteId: number) =>
    apiClient.get<Quiz[]>(`/notes/${noteId}/quizzes`).then(r => r.data),

  getQuiz: (quizId: number) =>
    apiClient.get<Quiz>(`/quizzes/${quizId}`).then(r => r.data),

  submitQuiz: (quizId: number, answers: Record<number, string>) =>
    apiClient.post<QuizSubmitResult>(`/quizzes/${quizId}/submit`, { answers }).then(r => r.data),
};
