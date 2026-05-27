'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Note } from '@/types/domain.types';
import { useCategories } from '@/hooks/useCategories';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().optional(),
  category_id: z.number().nullable().optional(),
});

type FormData = z.infer<typeof schema>;

interface NoteFormProps {
  defaultValues?: Partial<Note>;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function NoteForm({ defaultValues, onSubmit, onCancel, loading }: NoteFormProps) {
  const { data: categories } = useCategories();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      content: defaultValues?.content ?? '',
      category_id: defaultValues?.category?.id ?? null,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Title"
        id="title"
        placeholder="Note title…"
        error={errors.title?.message}
        {...register('title')}
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Category</label>
        <select
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          {...register('category_id', { valueAsNumber: true })}
        >
          <option value="">None</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Content</label>
        <textarea
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={8}
          placeholder="Write your notes here…"
          {...register('content')}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>
          {defaultValues ? 'Save Changes' : 'Create Note'}
        </Button>
      </div>
    </form>
  );
}
