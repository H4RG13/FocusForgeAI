'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import CategoryForm from './CategoryForm';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { Category } from '@/types/domain.types';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ManageCategoriesModal({ open, onClose }: Props) {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [view,          setView]          = useState<'list' | 'create' | 'edit' | 'delete'>('list');
  const [editing,       setEditing]       = useState<Category | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);

  function handleClose() {
    setView('list');
    setEditing(null);
    setConfirmDelete(null);
    onClose();
  }

  async function handleCreate(data: { name: string; color: string; icon?: string }) {
    await createCategory.mutateAsync(data);
    setView('list');
  }

  async function handleUpdate(data: { name: string; color: string; icon?: string }) {
    if (!editing) return;
    await updateCategory.mutateAsync({ id: editing.id, data });
    setEditing(null);
    setView('list');
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    await deleteCategory.mutateAsync(confirmDelete.id);
    setConfirmDelete(null);
    setView('list');
  }

  const titles: Record<typeof view, string> = {
    list:   'Manage Categories',
    create: 'New Category',
    edit:   'Edit Category',
    delete: 'Delete Category',
  };

  return (
    <Modal open={open} onClose={handleClose} title={titles[view]}>
      {view === 'list' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setView('create')}>+ New Category</Button>
          </div>

          {isLoading && (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          )}

          {!isLoading && categories?.length === 0 && (
            <EmptyState
              title="No categories yet"
              description="Create a category to organise your notes."
              action={<Button size="sm" onClick={() => setView('create')}>+ New Category</Button>}
            />
          )}

          {!isLoading && categories && categories.length > 0 && (
            <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold text-white"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.icon && <span>{cat.icon}</span>}
                    {cat.name}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(cat); setView('edit'); }}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => { setConfirmDelete(cat); setView('delete'); }}>Delete</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {view === 'create' && (
        <CategoryForm
          onSubmit={handleCreate}
          onCancel={() => setView('list')}
          loading={createCategory.isPending}
        />
      )}

      {view === 'edit' && editing && (
        <CategoryForm
          defaultValues={editing}
          onSubmit={handleUpdate}
          onCancel={() => { setEditing(null); setView('list'); }}
          loading={updateCategory.isPending}
        />
      )}

      {view === 'delete' && confirmDelete && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete <strong>{confirmDelete.name}</strong>?
            Notes in this category will not be deleted, but they will become uncategorised.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => { setConfirmDelete(null); setView('list'); }}>Cancel</Button>
            <Button variant="danger" loading={deleteCategory.isPending} onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
