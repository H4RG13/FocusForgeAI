'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { useGenerateQuiz, usePollGeneration, useNoteQuizzes } from '@/hooks/useAI';
import { QuizType } from '@/types/domain.types';
import { ROUTES } from '@/lib/constants/routes';

const QUIZ_TYPES: { value: QuizType; label: string; description: string }[] = [
  { value: 'multiple_choice', label: 'Multiple Choice', description: '4 options per question' },
  { value: 'true_false',      label: 'True / False',    description: 'Statement-based questions' },
  { value: 'identification',  label: 'Identification',  description: 'Type the correct answer' },
  { value: 'enumeration',     label: 'Enumeration',     description: 'Recall items from a list' },
];

interface QuizPanelProps {
  noteId: number;
  wordCount?: number;
}

export default function QuizPanel({ noteId, wordCount = 0 }: QuizPanelProps) {
  const router = useRouter();
  const [generationId, setGenerationId] = useState<number | null>(null);
  const [quizType, setQuizType]         = useState<QuizType>('multiple_choice');
  // Smart max: 1 question per 40 words, capped at 100, min 20
  const maxItems = Math.min(100, Math.max(20, Math.floor(wordCount / 40)));
  const [itemCount, setItemCount]       = useState(5);
  const [showForm, setShowForm]         = useState(false);

  const generateQuiz = useGenerateQuiz(noteId);
  const { data: quizzes, refetch: refetchQuizzes } = useNoteQuizzes(noteId);

  const { data: generation } = usePollGeneration(
    generationId,
    generationId !== null && (generateQuiz.data?.status === 'pending' || generateQuiz.data?.status === 'processing'),
  );

  const activeGen    = generation ?? generateQuiz.data;
  const isProcessing = activeGen?.status === 'pending' || activeGen?.status === 'processing';

  useEffect(() => {
    if (activeGen?.status === 'completed') {
      refetchQuizzes();
      setGenerationId(null);
      setShowForm(false);
    }
  }, [activeGen?.status]);

  function handleGenerate() {
    generateQuiz.mutate({ questionCount: itemCount, quizType }, {
      onSuccess: (gen) => {
        if (gen.status !== 'completed') {
          setGenerationId(gen.id);
        } else {
          refetchQuizzes();
          setShowForm(false);
        }
      },
    });
  }

  const quizTypeLabel: Record<QuizType, string> = {
    multiple_choice: 'MC',
    true_false:      'T/F',
    identification:  'ID',
    enumeration:     'Enum',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">AI Quiz</h3>
        {!isProcessing && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowForm((v) => !v)}
            disabled={isProcessing}
          >
            {showForm ? 'Cancel' : 'Generate Quiz'}
          </Button>
        )}
      </div>

      {/* Customization form */}
      {showForm && !isProcessing && (
        <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-3 space-y-3 dark:border-indigo-900 dark:bg-indigo-950/30">
          {/* Quiz type */}
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Quiz Type</p>
            <div className="grid grid-cols-2 gap-1.5">
              {QUIZ_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setQuizType(t.value)}
                  className={`text-left rounded-md border px-2.5 py-2 text-xs transition-colors ${
                    quizType === t.value
                      ? 'border-indigo-500 bg-indigo-100 text-indigo-700 font-medium dark:bg-indigo-900/60 dark:text-indigo-300'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400'
                  }`}
                >
                  <span className="font-semibold block">{t.label}</span>
                  <span className="text-gray-400 dark:text-gray-500">{t.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Item count */}
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Number of Items: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{itemCount}</span>
            </p>
            <input
              type="range"
              min={3}
              max={maxItems}
              value={itemCount}
              onChange={(e) => setItemCount(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              <span>3</span>
              <span>{maxItems} {maxItems === 100 ? '(max)' : `(~${wordCount} words)`}</span>
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleGenerate}
            loading={generateQuiz.isPending}
            className="w-full"
          >
            Generate {itemCount}-Item {QUIZ_TYPES.find(t => t.value === quizType)?.label} Quiz
          </Button>
        </div>
      )}

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
                  <span className="mr-1.5 rounded bg-indigo-100 px-1 py-0.5 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                    {quizTypeLabel[quiz.quiz_type] ?? 'MC'}
                  </span>
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

      {quizzes?.length === 0 && !isProcessing && !showForm && (
        <p className="text-sm text-gray-400">No quizzes yet. Generate one above.</p>
      )}
    </div>
  );
}
