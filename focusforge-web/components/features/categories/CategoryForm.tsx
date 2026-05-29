'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Category } from '@/types/domain.types';

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#06b6d4', '#64748b', '#78716c',
];

const schema = z.object({
  name:  z.string().min(1, 'Name is required').max(50),
  color: z.string().min(1, 'Color is required'),
  icon:  z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CategoryFormProps {
  defaultValues?: Partial<Category>;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function CategoryForm({ defaultValues, onSubmit, onCancel, loading }: CategoryFormProps) {
  const [customColor, setCustomColor] = useState(defaultValues?.color ?? '#6366f1');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:  defaultValues?.name  ?? '',
      color: defaultValues?.color ?? '#6366f1',
      icon:  defaultValues?.icon  ?? '',
    },
  });

  const selectedColor = watch('color');

  function pickColor(color: string) {
    setCustomColor(color);
    setValue('color', color);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Name"
        id="name"
        placeholder="e.g. Work, Study, Personal…"
        error={errors.name?.message}
        {...register('name')}
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Color</label>

        {/* Preset swatches */}
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => pickColor(color)}
              className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: color,
                borderColor: selectedColor === color ? '#1e293b' : 'transparent',
              }}
            />
          ))}
        </div>

        {/* Custom color input */}
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={customColor}
            onChange={(e) => pickColor(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded border border-gray-300"
          />
          <span className="text-xs text-gray-500 font-mono">{selectedColor}</span>
          <input type="hidden" {...register('color')} />
        </div>
        {errors.color && <p className="text-xs text-red-500">{errors.color.message}</p>}
      </div>

      <Input
        label="Icon (optional)"
        id="icon"
        placeholder="e.g. briefcase, book, star…"
        {...register('icon')}
      />

      {/* Preview */}
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
        <span className="text-xs text-gray-400">Preview:</span>
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
          style={{ backgroundColor: selectedColor }}
        >
          {watch('name') || 'Category Name'}
        </span>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>
          {defaultValues?.id ? 'Save Changes' : 'Create Category'}
        </Button>
      </div>
    </form>
  );
}
