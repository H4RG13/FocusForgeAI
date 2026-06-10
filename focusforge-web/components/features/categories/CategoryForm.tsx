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

const ICON_OPTIONS = [
  // Work & productivity
  '💼', '🖥️', '📊', '📈', '🏢', '📋', '✅', '🎯',
  // Study & learning
  '📚', '📖', '✏️', '🎓', '🔬', '🧪', '🧠', '💡',
  // Personal & lifestyle
  '🏠', '❤️', '⭐', '💪', '🧘', '🛒', '🎁', '🎉',
  // Health & fitness
  '🏃', '🥗', '💊', '💤', '🚴', '🏋️', '🩺', '🌿',
  // Finance
  '💰', '💳', '📉', '🪙', '💵', '🏦', '📑', '🤝',
  // Creative & hobbies
  '🎨', '🎵', '📷', '✍️', '🎭', '🎬', '🎮', '🎸',
  // Travel & places
  '✈️', '🌍', '🗺️', '🏖️', '🏕️', '🚗', '🚂', '⛵',
  // Food & drink
  '🍕', '🍎', '☕', '🍜', '🥤', '🍣', '🥐', '🍰',
  // General
  '📌', '🔖', '🏷️', '📂', '🗂️', '🔔', '📬', '🔑',
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
  const [showAllIcons, setShowAllIcons] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:  defaultValues?.name  ?? '',
      color: defaultValues?.color ?? '#6366f1',
      icon:  defaultValues?.icon  ?? '',
    },
  });

  const selectedColor = watch('color');
  const selectedIcon  = watch('icon');

  function pickColor(color: string) {
    setCustomColor(color);
    setValue('color', color);
  }

  function pickIcon(emoji: string) {
    setValue('icon', selectedIcon === emoji ? '' : emoji);
  }

  const visibleIcons = showAllIcons ? ICON_OPTIONS : ICON_OPTIONS.slice(0, 32);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Name"
        id="name"
        placeholder="e.g. Work, Study, Personal…"
        error={errors.name?.message}
        {...register('name')}
      />

      {/* Color */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
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
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={customColor}
            onChange={(e) => pickColor(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
          />
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{selectedColor}</span>
          <input type="hidden" {...register('color')} />
        </div>
        {errors.color && <p className="text-xs text-red-500">{errors.color.message}</p>}
      </div>

      {/* Icon picker */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Icon <span className="font-normal text-gray-400">(optional)</span>
          </label>
          {selectedIcon && (
            <button
              type="button"
              onClick={() => setValue('icon', '')}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="grid grid-cols-8 gap-1">
            {visibleIcons.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => pickIcon(emoji)}
                title={emoji}
                className={`flex h-9 w-full items-center justify-center rounded-lg text-lg transition-colors hover:bg-white hover:shadow-sm dark:hover:bg-gray-700 ${
                  selectedIcon === emoji
                    ? 'bg-white shadow ring-2 ring-indigo-400 dark:bg-gray-700'
                    : ''
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {ICON_OPTIONS.length > 32 && (
            <button
              type="button"
              onClick={() => setShowAllIcons((v) => !v)}
              className="mt-2 w-full rounded-md py-1 text-xs text-gray-400 hover:text-indigo-600 transition-colors dark:hover:text-indigo-400"
            >
              {showAllIcons ? '▲ Show less' : `▼ Show all (${ICON_OPTIONS.length})`}
            </button>
          )}
        </div>
        <input type="hidden" {...register('icon')} />
      </div>

      {/* Preview */}
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
        <span className="text-xs text-gray-400 dark:text-gray-500">Preview:</span>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
          style={{ backgroundColor: selectedColor }}
        >
          {selectedIcon && <span>{selectedIcon}</span>}
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
