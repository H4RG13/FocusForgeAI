'use client';

import { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import CategoryForm from '@/components/features/categories/CategoryForm';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { Category } from '@/types/domain.types';

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [showCreate, setShowCreate]           = useState(false);
  const [editing, setEditing]                 = useState<Category | null>(null);
  const [confirmDelete, setConfirmDelete]     = useState<Category | null>(null);

  async function handleCreate(data: { name: string; color: string; icon?: string }) {
    await createCategory.mutateAsync(data);
    setShowCreate(false);
  }

  async function handleUpdate(data: { name: string; color: string; icon?: string }) {
    if (!editing) return;
    await updateCategory.mutateAsync({ id: editing.id, data });
    setEditing(null);
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    await deleteCategory.mutateAsync(confirmDelete.id);
    setConfirmDelete(null);
  }

  return (
    <div className="flex flex-col">
      <TopBar title="Categories" />

      <div className="mx-auto w-full max-w-3xl p-6 space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => setShowCreate(true)}>+ New Category</Button>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}
          </div>
        )}

        {!isLoading && categories?.length === 0 && (
          <EmptyState
            title="No categories yet"
            description="Create a category to organise your tasks and notes."
            action={<Button onClick={() => setShowCreate(true)}>+ New Category</Button>}
          />
        )}

        {!isLoading && categories && categories.length > 0 && (
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="flex items-center gap-3">
                  {/* Color swatch */}
                  <span
                    className="h-5 w-5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{cat.name}</p>
                    {cat.icon && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">{cat.icon}</p>
                    )}
                  </div>
                  {/* Badge preview */}
                  <span
                    className="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.name}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(cat)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => setConfirmDelete(cat)}>Delete</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Category">
        <CategoryForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          loading={createCategory.isPending}
        />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Category">
        {editing && (
          <CategoryForm
            defaultValues={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            loading={updateCategory.isPending}
          />
        )}
      </Modal>

      {/* Delete confirm modal */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Category">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete <strong>{confirmDelete?.name}</strong>?
            Tasks and notes in this category will not be deleted, but they will become uncategorised.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="danger" loading={deleteCategory.isPending} onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
