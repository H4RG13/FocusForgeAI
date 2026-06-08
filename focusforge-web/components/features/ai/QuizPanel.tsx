'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { useGenerateQuiz, usePollGeneration, useNoteQuizzes } from '@/hooks/useAI';
import { ROUTES } from '@/lib/constants/routes';

interface QuizPanelProps {
  noteId: number;
}

export default function QuizPanel({ noteId }: QuizPanelProps) {
  const router = useRouter();
  const [generationId, setGenerationId] = useState<number | null>(null);
  const generateQuiz = useGenerateQuiz(noteId);
  const { data: quizzes, refetch: refetchQuizzes } = useNoteQuizzes(noteId);

  const { data: generation } = usePollGeneration(
    generationId,
    generationId !== null && (generateQuiz.data?.status === 'pending' || generateQuiz.data?.status === 'processing')
  );

  const activeGen = generation ?? generateQuiz.data;
  const isProcessing = activeGen?.status === 'pending' || activeGen?.status === 'processing';

  function handleGenerate() {
    generateQuiz.mutate(5, {
      onSuccess: (gen) => {
        if (gen.status !== 'completed') {
          setGenerationId(gen.id);
        } else {
          refetchQuizzes();
        }
      },
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">AI Quiz</h3>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleGenerate}
          loading={generateQuiz.isPending || isProcessing}
          disabled={isProcessing}
        >
          Generate Quiz
        </Button>
      </div>

      {isProcessing && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Spinner size="sm" />
          <span>Building quiz questions…</span>
        </div>
      )}

      {quizzes && quizzes.length > 0 && (
        <ul className="space-y-2">
          {quizzes.map((quiz) => (
            <li
              key={quiz.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            >
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{quiz.title}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {quiz.attempts_count} attempt{quiz.attempts_count !== 1 ? 's' : ''}
                  {quiz.score !== null ? ` · Best: ${quiz.score}%` : ''}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => router.push(ROUTES.QUIZ(quiz.id))}
              >
                {quiz.attempts_count > 0 ? 'Retry' : 'Start'}
              </Button>
            </li>
          ))}
        </ul>
      )}

      {quizzes?.length === 0 && !isProcessing && (
        <p className="text-sm text-gray-400">No quizzes yet. Generate one above.</p>
      )}
    </div>
  );
}
