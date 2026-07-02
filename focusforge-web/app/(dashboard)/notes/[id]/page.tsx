'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import Button from '@/components/ui/Button';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import SummaryPanel from '@/components/features/ai/SummaryPanel';
import QuizPanel from '@/components/features/ai/QuizPanel';
import { useNote, useUpdateNote } from '@/hooks/useNotes';
import { formatDate } from '@/lib/utils/format';
import { ROUTES } from '@/lib/constants/routes';

export default function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const noteId = parseInt(id, 10);
  const router = useRouter();
  const { data: note, isLoading } = useNote(noteId);
  const updateNote = useUpdateNote();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const startEdit = () => {
    setTitle(note?.title ?? '');
    setContent(note?.content ?? '');
    setEditing(true);
  };

  const saveEdit = async () => {
    await updateNote.mutateAsync({ id: noteId, data: { title, content } });
    setEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <TopBar title="Note" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex flex-col">
        <TopBar title="Note" />
        <div className="p-6 text-center text-gray-500">Note not found.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <TopBar title="Note" />
      <div className="mx-auto w-full max-w-6xl p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main note column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                {editing ? (
                  <input
                    className="text-2xl font-bold text-gray-900 w-full border-b border-indigo-400 bg-transparent pb-1 focus:outline-none dark:text-gray-100"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{note.title}</h1>
                )}
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  {note.word_count} words · Updated {formatDate(note.updated_at)}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                {editing ? (
                  <>
                    <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                    <Button size="sm" loading={updateNote.isPending} onClick={saveEdit}>Save</Button>
                  </>
                ) : (
                  <>
                    <Button variant="secondary" size="sm" onClick={startEdit}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.NOTES)}>← Back</Button>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm min-h-[400px] dark:border-gray-700 dark:bg-gray-900">
              {editing ? (
                <textarea
                  className="w-full h-full min-h-[360px] text-sm text-gray-700 leading-relaxed resize-none focus:outline-none dark:text-gray-300 dark:bg-transparent"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your notes here…"
                />
              ) : (
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap dark:text-gray-300">
                  {note.content || <span className="text-gray-400 italic dark:text-gray-500">No content yet. Click Edit to add some.</span>}
                </div>
              )}
            </div>
          </div>

          {/* AI sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <SummaryPanel noteId={noteId} />
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <QuizPanel noteId={noteId} wordCount={note.word_count ?? 0} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
