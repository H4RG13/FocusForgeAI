'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SelectInput from '@/components/ui/SelectInput';
import { Task } from '@/types/domain.types';
import { useCategories } from '@/hooks/useCategories';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['todo', 'in_progress', 'done', 'archived']),
  due_date: z.string().optional(),
  category_id: z.number().nullable().optional(),
});

type FormData = z.infer<typeof schema>;

interface TaskFormProps {
  defaultValues?: Partial<Task>;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const PRIORITY_OPTIONS = [
  { value: 'low',    label: 'Low'    },
  { value: 'medium', label: 'Medium' },
  { value: 'high',   label: 'High'   },
  { value: 'urgent', label: 'Urgent' },
];

const STATUS_OPTIONS = [
  { value: 'todo',        label: 'To Do'       },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done',        label: 'Done'        },
  { value: 'archived',    label: 'Archived'    },
];

export default function TaskForm({ defaultValues, onSubmit, onCancel, loading }: TaskFormProps) {
  const { data: categories } = useCategories();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      priority: defaultValues?.priority ?? 'medium',
      status: defaultValues?.status ?? 'todo',
      due_date: defaultValues?.due_date ?? '',
      category_id: defaultValues?.category?.id ?? null,
    },
  });

  const priorityValue   = watch('priority');
  const statusValue     = watch('status');
  const categoryIdValue = watch('category_id');

  const categoryOptions = [
    { value: '', label: 'None' },
    ...(categories?.map((c) => ({ value: String(c.id), label: c.name })) ?? []),
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Title"
        id="title"
        placeholder="Task title…"
        error={errors.title?.message}
        {...register('title')}
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
        <textarea
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
          rows={3}
          placeholder="Optional details…"
          {...register('description')}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
          <SelectInput
            value={priorityValue}
            onChange={(v) => setValue('priority', v as FormData['priority'])}
            options={PRIORITY_OPTIONS}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
          <SelectInput
            value={statusValue}
            onChange={(v) => setValue('status', v as FormData['status'])}
            options={STATUS_OPTIONS}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Due Date"
          id="due_date"
          type="date"
          {...register('due_date')}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
          <SelectInput
            value={categoryIdValue == null ? '' : String(categoryIdValue)}
            onChange={(v) => setValue('category_id', v === '' ? null : parseInt(v, 10))}
            options={categoryOptions}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>
          {defaultValues ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
