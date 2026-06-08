'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { aiApi } from '@/lib/api/ai';
import { AIGeneration, StudyPlanResult } from '@/types/domain.types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const schema = z.object({
  topic:   z.string().min(2, 'Topic is required'),
  context: z.string().max(3000).optional(),
});
type FormData = z.infer<typeof schema>;

export default function StudyPlanPanel({ compact = false }: { compact?: boolean }) {
  const [generation, setGeneration] = useState<AIGeneration | null>(null);
  const [polling, setPolling] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    const gen = await aiApi.generateStudyPlan(data.topic, data.context);
    setGeneration(gen);
    setPlan(null);
    setPolling(true);
    pollUntilDone(gen.id);
  }

  async function pollUntilDone(id: number) {
    const interval = setInterval(async () => {
      try {
        const result = await aiApi.pollGeneration(id);
        if (result.status === 'completed') {
          clearInterval(interval);
          setPolling(false);
          setPlan((result.result as StudyPlanResult | null)?.plan ?? null);
        } else if (result.status === 'failed') {
          clearInterval(interval);
          setPolling(false);
        }
      } catch {
        clearInterval(interval);
        setPolling(false);
      }
    }, 2000);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-100">Generate Study Plan</h3>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          Enter a topic and optional context (e.g. exam date, difficulty areas) to get a personalized study plan.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Topic"
            id="topic"
            placeholder="e.g. Organic Chemistry, World War II, Calculus"
            error={errors.topic?.message}
            {...register('topic')}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Context <span className="text-gray-400 dark:text-gray-500">(optional)</span>
            </label>
            <textarea
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
              rows={3}
              placeholder="e.g. Exam in 2 weeks, struggling with reaction mechanisms, need to cover chapters 5–9"
              {...register('context')}
            />
          </div>

          <Button type="submit" loading={isSubmitting} disabled={polling}>
            {polling ? 'Generating…' : 'Generate Plan'}
          </Button>
        </form>
      </div>

      {(polling || plan) && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6 dark:border-indigo-900 dark:bg-indigo-950/40">
          {polling ? (
            <div className="flex items-center gap-3 text-sm text-indigo-600">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              AI is generating your study plan…
            </div>
          ) : plan ? (
            <div>
              <h4 className="mb-3 text-sm font-semibold text-indigo-900 dark:text-indigo-300">Your Study Plan</h4>
              <div className="prose prose-sm max-w-none text-gray-800 dark:text-gray-200">
                {plan.split('\n').map((line, i) => (
                  <p key={i} className="my-0.5">{line}</p>
                ))}
              </div>
              <button
                onClick={() => { setGeneration(null); setPlan(null); }}
                className="mt-4 text-xs text-indigo-600 hover:underline"
              >
                Generate another plan
              </button>
            </div>
          ) : (
            <p className="text-sm text-red-500">Failed to generate plan. Please try again.</p>
          )}
        </div>
      )}
    </div>
  );
}
