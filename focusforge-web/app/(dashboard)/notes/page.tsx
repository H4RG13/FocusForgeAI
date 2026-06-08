'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import NoteCard from '@/components/features/notes/NoteCard';
import NoteForm from '@/components/features/notes/NoteForm';
import EmptyState from '@/components/shared/EmptyState';
import { ListSkeleton } from '@/components/shared/LoadingSkeleton';
import { useNotes, useCreateNote } from '@/hooks/useNotes';
import { ROUTES } from '@/lib/constants/routes';

export default function NotesPage() {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const { data, isLoading } = useNotes();
  const createNote = useCreateNote();

  const handleCreate = async (formData: any) => {
    const note = await createNote.mutateAsync(formData);
    setShowCreate(false);
    router.push(ROUTES.NOTE(note.id));
  };

  return (
    <div className="flex flex-col">
      <TopBar title="Notes" />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">{data?.data.length ?? 0} notes</p>
          <Button onClick={() => setShowCreate(true)} size="sm">+ New Note</Button>
        </div>

        {isLoading ? (
          <ListSkeleton count={6} />
        ) : data?.data.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No notes yet"
            description="Create your first note to start capturing ideas."
            action={<Button onClick={() => setShowCreate(true)} size="sm">+ New Note</Button>}
          />
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Note">
        <NoteForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          loading={createNote.isPending}
        />
      </Modal>
    </div>
  );
}
