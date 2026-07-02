'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Quiz, QuizType } from '@/types/domain.types';

interface Props {
  open: boolean;
  onClose: () => void;
  quizzes: Quiz[];
  noteTitle: string;
  onExport: (orderedIds: number[]) => void;
  isExporting: boolean;
}

const TYPE_LABEL: Record<QuizType, string> = {
  multiple_choice: 'MC',
  true_false:      'T/F',
  identification:  'ID',
  enumeration:     'Enum',
};

export default function ExportQuizModal({ open, onClose, quizzes, noteTitle, onExport, isExporting }: Props) {
  const [ordered, setOrdered] = useState<Quiz[]>([]);

  useEffect(() => {
    setOrdered([...quizzes]);
  }, [quizzes, open]);

  function move(index: number, direction: -1 | 1) {
    const next = [...ordered];
    const swap = index + direction;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    setOrdered(next);
  }

  return (
    <Modal open={open} onClose={onClose} title="Export Quizzes to Word" className="max-w-lg">
      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Drag to reorder using the arrows. All quizzes will be compiled into one <strong>.docx</strong> file with an answer key at the end.
      </p>

      <ul className="mb-4 space-y-2 max-h-72 overflow-y-auto pr-1">
        {ordered.map((quiz, i) => (
          <li
            key={quiz.id}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
          >
            {/* Order number */}
            <span className="w-5 shrink-0 text-center text-xs font-bold text-gray-400">{i + 1}</span>

            {/* Quiz info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">{quiz.title}</p>
              <p className="text-xs text-gray-400">
                <span className="mr-1 rounded bg-indigo-100 px-1 py-0.5 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                  {TYPE_LABEL[quiz.quiz_type] ?? 'MC'}
                </span>
                {quiz.questions?.length ?? 0} items
              </p>
            </div>

            {/* Up / Down */}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="rounded p-0.5 text-gray-400 hover:bg-gray-200 disabled:opacity-20 dark:hover:bg-gray-700"
                title="Move up"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === ordered.length - 1}
                className="rounded p-0.5 text-gray-400 hover:bg-gray-200 disabled:opacity-20 dark:hover:bg-gray-700"
                title="Move down"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onClose} disabled={isExporting}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={() => onExport(ordered.map((q) => q.id))}
          loading={isExporting}
          disabled={ordered.length === 0}
        >
          Download .docx
        </Button>
      </div>
    </Modal>
  );
}
