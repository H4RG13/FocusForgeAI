import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi, NoteListParams } from '@/lib/api/notes';
import { useUIStore } from '@/store/ui.store';
import type { CreateNotePayload, UpdateNotePayload } from '@/types/api.types';

export const NOTES_KEY = 'notes';

export function useNotes(params?: NoteListParams) {
  return useQuery({
    queryKey: [NOTES_KEY, params],
    queryFn: () => notesApi.list(params).then((r) => r.data),
  });
}

export function useNote(id: number) {
  return useQuery({
    queryKey: [NOTES_KEY, id],
    queryFn: () => notesApi.get(id).then((r) => r.data.data),
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (data: CreateNotePayload) => notesApi.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [NOTES_KEY] });
      addToast({ type: 'success', message: 'Note created.' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to create note.' }),
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateNotePayload }) =>
      notesApi.update(id, data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [NOTES_KEY] });
      addToast({ type: 'success', message: 'Note saved.' });
    },
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (id: number) => notesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [NOTES_KEY] });
      addToast({ type: 'success', message: 'Note deleted.' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to delete note.' }),
  });
}
