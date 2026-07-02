'use client';

import { useState, useEffect, useRef } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Quiz, QuizType } from '@/types/domain.types';

interface Props {
  open: boolean;
  onClose: () => void;
  quizzes: Quiz[];
  noteTitle: string;
  onExport: (orderedIds: number[], filename: string) => void;
  isExporting: boolean;
}

const TYPE_LABEL: Record<QuizType, string> = {
  multiple_choice: 'MC',
  true_false:      'T/F',
  identification:  'ID',
  enumeration:     'Enum',
};

function toSlug(title: string) {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-quizzes';
}

export default function ExportQuizModal({ open, onClose, quizzes, noteTitle, onExport, isExporting }: Props) {
  const [ordered, setOrdered]   = useState<Quiz[]>([]);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [filename, setFilename] = useState('');
  const dragIndex               = useRef<number | null>(null);

  useEffect(() => {
    setOrdered([...quizzes]);
    setFilename(toSlug(noteTitle));
  }, [quizzes, noteTitle, open]);

  function onDragStart(i: number) {
    dragIndex.current = i;
  }

  function onDragEnter(i: number) {
    setDragOver(i);
  }

  function onDrop(i: number) {
    const from = dragIndex.current;
    if (from === null || from === i) return;
    const next = [...ordered];
    const [item] = next.splice(from, 1);
    next.splice(i, 0, item);
    setOrdered(next);
    dragIndex.current = null;
    setDragOver(null);
  }

  function onDragEnd() {
    dragIndex.current = null;
    setDragOver(null);
  }

  return (
    <Modal open={open} onClose={onClose} title="Export Quizzes to Word" className="max-w-lg">
      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Drag to reorder. All quizzes will be compiled into one <strong>.docx</strong> file with an answer key at the end.
      </p>

      <ul className="mb-4 space-y-2 max-h-72 overflow-y-auto pr-1">
        {ordered.map((quiz, i) => (
          <li
            key={quiz.id}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragEnter={() => onDragEnter(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(i)}
            onDragEnd={onDragEnd}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors cursor-grab active:cursor-grabbing select-none ${
              dragOver === i
                ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/40'
                : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
            }`}
          >
            {/* Drag handle */}
            <svg className="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="9"  cy="6"  r="1.5" />
              <circle cx="15" cy="6"  r="1.5" />
              <circle cx="9"  cy="12" r="1.5" />
              <circle cx="15" cy="12" r="1.5" />
              <circle cx="9"  cy="18" r="1.5" />
              <circle cx="15" cy="18" r="1.5" />
            </svg>

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
          </li>
        ))}
      </ul>

      {/* Filename */}
      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
          File name
        </label>
        <div className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 dark:border-gray-700 dark:bg-gray-900">
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value.replace(/[^a-zA-Z0-9_\-]/g, '-'))}
            className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none dark:text-gray-200"
            spellCheck={false}
          />
          <span className="ml-1 shrink-0 text-xs text-gray-400">.docx</span>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onClose} disabled={isExporting}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={() => onExport(ordered.map((q) => q.id), filename)}
          loading={isExporting}
          disabled={ordered.length === 0 || !filename.trim()}
        >
          Download .docx
        </Button>
      </div>
    </Modal>
  );
}
