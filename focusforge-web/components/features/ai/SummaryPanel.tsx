'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { useSummarize, usePollGeneration } from '@/hooks/useAI';
import { SummaryResult } from '@/types/domain.types';

interface SummaryPanelProps {
  noteId: number;
}

export default function SummaryPanel({ noteId }: SummaryPanelProps) {
  const [generationId, setGenerationId] = useState<number | null>(null);
  const summarize = useSummarize(noteId);
  const { data: generation } = usePollGeneration(
    generationId,
    generationId !== null && (summarize.data?.status === 'pending' || summarize.data?.status === 'processing')
  );

  const activeGen = generation ?? summarize.data;
  const isProcessing = activeGen?.status === 'pending' || activeGen?.status === 'processing';
  const isDone = activeGen?.status === 'completed';
  const isFailed = activeGen?.status === 'failed';

  const result = isDone ? (activeGen?.result as SummaryResult | null) : null;

  function handleSummarize() {
    summarize.mutate(undefined, {
      onSuccess: (gen) => {
        if (gen.status !== 'completed') {
          setGenerationId(gen.id);
        }
      },
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">AI Summary</h3>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleSummarize}
          loading={summarize.isPending || isProcessing}
          disabled={isProcessing}
        >
          {isDone ? 'Regenerate' : 'Summarize'}
        </Button>
      </div>

      {isProcessing && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Spinner size="sm" />
          <span>Generating summary…</span>
        </div>
      )}

      {isFailed && (
        <p className="text-sm text-red-500">
          {activeGen?.error_message ?? 'Failed to generate summary. Please try again.'}
        </p>
      )}

      {result && (
        <Card className="space-y-3 bg-indigo-50 border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-900">
          <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap dark:text-gray-200">
            {result.summary}
          </div>
          {result.key_points?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 dark:text-gray-400">Key Points</p>
              <ul className="list-disc list-inside space-y-1">
                {result.key_points.map((point, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300">{point}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
