'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import { useQuiz, useSubmitQuiz } from '@/hooks/useAI';
import { QuizSubmitResult } from '@/types/domain.types';
import { ROUTES } from '@/lib/constants/routes';

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const quizId = parseInt(id, 10);
  const router = useRouter();

  const { data: quiz, isLoading } = useQuiz(quizId);
  const submitQuiz = useSubmitQuiz(quizId);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<QuizSubmitResult | null>(null);

  function handleSelect(questionId: number, option: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }

  async function handleSubmit() {
    const res = await submitQuiz.mutateAsync(answers);
    setResult(res);
  }

  const allAnswered = quiz?.questions.every((q) => answers[q.id] !== undefined) ?? false;

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <TopBar title="Quiz" />
        <div className="p-6 space-y-4 max-w-2xl mx-auto w-full">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex flex-col">
        <TopBar title="Quiz" />
        <div className="p-6 text-center text-gray-500">Quiz not found.</div>
      </div>
    );
  }

  if (result) {
    const enriched = {
      ...result,
      results: result.results.map((r) => {
        const q = quiz.questions.find((q) => q.id === r.question_id);
        const letterToText = (letter: string) => {
          const idx = letter.charCodeAt(0) - 65;
          return q?.options[idx] ? `${letter}. ${q.options[idx]}` : letter;
        };
        return {
          ...r,
          given_answer:   r.given_answer   ? letterToText(r.given_answer)   : null,
          correct_answer: letterToText(r.correct_answer),
        };
      }),
    };
    return <QuizResults quiz={quiz} result={enriched} onRetry={() => { setResult(null); setAnswers({}); }} onBack={() => router.back()} />;
  }

  return (
    <div className="flex flex-col">
      <TopBar title={quiz.title} />
      <div className="mx-auto w-full max-w-2xl p-6 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Back</Button>

        <div className="space-y-4">
          {quiz.questions.map((q, index) => (
            <Card key={q.id} className="space-y-3">
              <p className="font-medium text-gray-800 dark:text-gray-200">
                <span className="text-indigo-500 font-bold mr-2">{index + 1}.</span>
                {q.question}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {q.options.map((option, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
                  const selected = answers[q.id] === letter;
                  return (
                    <button
                      key={option}
                      onClick={() => handleSelect(q.id, letter)}
                      className={`text-left rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                        selected
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-950/50 dark:text-indigo-300'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/30'
                      }`}
                    >
                      <span className="font-semibold mr-2">{letter}.</span>{option}
                    </button>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSubmit}
            loading={submitQuiz.isPending}
            disabled={!allAnswered}
          >
            Submit Quiz
          </Button>
        </div>
      </div>
    </div>
  );
}

function QuizResults({ quiz, result, onRetry, onBack }: {
  quiz: { title: string };
  result: QuizSubmitResult;
  onRetry: () => void;
  onBack: () => void;
}) {
  const scoreColor = result.score >= 80 ? 'text-green-600 dark:text-green-400' : result.score >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400';
  const scoreBg   = result.score >= 80 ? 'bg-green-50 dark:bg-green-950/30'   : result.score >= 50 ? 'bg-yellow-50 dark:bg-yellow-950/30'   : 'bg-red-50 dark:bg-red-950/30';

  return (
    <div className="flex flex-col">
      <TopBar title="Quiz Results" />
      <div className="mx-auto w-full max-w-2xl p-6 space-y-6">
        {/* Score card */}
        <Card className={`text-center space-y-1 ${scoreBg}`}>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your Score</p>
          <p className={`text-5xl font-bold ${scoreColor}`}>{result.score}%</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {result.correct} of {result.total} correct
          </p>
        </Card>

        {/* Breakdown */}
        <div className="space-y-3">
          {result.results.map((r, i) => (
            <Card key={r.question_id} className="space-y-2">
              <div className="flex items-start gap-2">
                <span className={`mt-0.5 shrink-0 text-lg ${r.is_correct ? 'text-green-500' : 'text-red-500'}`}>
                  {r.is_correct ? '✓' : '✗'}
                </span>
                <p className="font-medium text-gray-800 text-sm dark:text-gray-200">
                  <span className="text-gray-400 mr-1 dark:text-gray-500">{i + 1}.</span>{r.question}
                </p>
              </div>
              {!r.is_correct && (
                <div className="ml-6 space-y-1 text-sm">
                  <p className="text-red-600">Your answer: {r.given_answer ?? 'No answer'}</p>
                  <p className="text-green-700 font-medium">Correct: {r.correct_answer}</p>
                </div>
              )}
              <p className="ml-6 text-xs text-gray-500 italic dark:text-gray-400">{r.explanation}</p>
            </Card>
          ))}
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onBack}>Back to Note</Button>
          <Button onClick={onRetry}>Try Again</Button>
        </div>
      </div>
    </div>
  );
}
