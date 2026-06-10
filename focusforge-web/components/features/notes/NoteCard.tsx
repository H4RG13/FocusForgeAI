'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Note } from '@/types/domain.types';
import Badge from '@/components/ui/Badge';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { formatRelativeDate, truncate } from '@/lib/utils/format';
import { useDeleteNote } from '@/hooks/useNotes';
import { ROUTES } from '@/lib/constants/routes';

interface NoteCardProps {
  note: Note;
}

export default function NoteCard({ note }: NoteCardProps) {
  const deleteNote = useDeleteNote();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => { deleteNote.mutate(note.id); setConfirmOpen(false); }}
        title="Delete Note"
        message={`Delete "${truncate(note.title, 50)}"? This cannot be undone.`}
        loading={deleteNote.isPending}
      />

      <div className="group relative flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
        <Link href={ROUTES.NOTE(note.id)} className="flex-1">
          <h3 className="mb-1 font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
            {truncate(note.title, 60)}
          </h3>
          {note.content && (
            <p className="text-sm text-gray-500 line-clamp-3 dark:text-gray-400">
              {truncate(note.content.replace(/<[^>]+>/g, ''), 140)}
            </p>
          )}
        </Link>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {note.category && (
              <Badge style={{ backgroundColor: note.category.color + '20', color: note.category.color }}>
                {note.category.name}
              </Badge>
            )}
            <span className="text-xs text-gray-400 dark:text-gray-500">{note.word_count} words</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400 dark:text-gray-500">{formatRelativeDate(note.updated_at)}</span>
            <button
              onClick={(e) => { e.preventDefault(); setConfirmOpen(true); }}
              className="ml-2 rounded p-1 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
