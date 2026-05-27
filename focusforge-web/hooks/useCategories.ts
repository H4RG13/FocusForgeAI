import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '@/lib/api/categories';
import { useUIStore } from '@/store/ui.store';
import type { CreateCategoryPayload } from '@/types/api.types';

export const CATEGORIES_KEY = 'categories';

export function useCategories() {
  return useQuery({
    queryKey: [CATEGORIES_KEY],
    queryFn: () => categoriesApi.list().then((r) => r.data.data),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (data: CreateCategoryPayload) =>
      categoriesApi.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
      addToast({ type: 'success', message: 'Category created.' });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (id: number) => categoriesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
      addToast({ type: 'success', message: 'Category deleted.' });
    },
  });
}
