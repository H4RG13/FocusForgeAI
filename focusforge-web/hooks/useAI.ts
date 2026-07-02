import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '@/lib/api/ai';
import { AIGeneration } from '@/types/domain.types';

export function useSummarize(noteId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => aiApi.summarize(noteId),
    onSuccess: (gen) => {
      queryClient.setQueryData(['ai-generation', gen.id], gen);
    },
  });
}

export function useGenerateQuiz(noteId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionCount, quizType }: { questionCount?: number; quizType?: string }) =>
      aiApi.generateQuiz(noteId, questionCount, quizType),
    onSuccess: (gen) => {
      queryClient.setQueryData(['ai-generation', gen.id], gen);
    },
  });
}

export function usePollGeneration(id: number | null, enabled: boolean) {
  return useQuery<AIGeneration>({
    queryKey: ['ai-generation', id],
    queryFn: () => aiApi.pollGeneration(id!),
    enabled: !!id && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'completed' || status === 'failed') return false;
      return 2000;
    },
  });
}

export function useNoteQuizzes(noteId: number) {
  return useQuery({
    queryKey: ['quizzes', noteId],
    queryFn: () => aiApi.getQuizzes(noteId),
  });
}

export function useQuiz(quizId: number) {
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => aiApi.getQuiz(quizId),
  });
}

export function useSubmitQuiz(quizId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (answers: Record<number, string>) => aiApi.submitQuiz(quizId, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
    },
  });
}

export function useDeleteQuiz(noteId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quizId: number) => aiApi.deleteQuiz(quizId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', noteId] });
    },
  });
}
