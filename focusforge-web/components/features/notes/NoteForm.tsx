'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SelectInput from '@/components/ui/SelectInput';
import { Note } from '@/types/domain.types';
import { useCategories } from '@/hooks/useCategories';
import { extractFileContent, isAcceptedFile, ACCEPT_ATTR } from '@/lib/utils/fileExtract';

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
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      content: defaultValues?.content ?? '',
      category_id: defaultValues?.category?.id ?? null,
    },
  });

  const categoryIdValue = watch('category_id');
  const categoryOptions = [
    { value: '', label: 'None' },
    ...(categories?.map((c) => ({ value: String(c.id), label: c.name })) ?? []),
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAcceptedFile(file)) {
      setImportError('Unsupported file type. Please use PDF, DOCX, DOC, PPTX, TXT, or MD.');
      e.target.value = '';
      return;
    }

    setImportError(null);
    setImporting(true);
    try {
      const result = await extractFileContent(file);
      // Only prefill title if it's a new note (no defaultValues)
      if (!defaultValues?.title) {
        setValue('title', result.title, { shouldValidate: true });
      }
      setValue('content', result.content, { shouldValidate: true });
    } catch {
      setImportError('Failed to read file. Try copy-pasting the content instead.');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  }

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
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
        <SelectInput
          value={categoryIdValue == null ? '' : String(categoryIdValue)}
          onChange={(v) => setValue('category_id', v === '' ? null : parseInt(v, 10))}
          options={categoryOptions}
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-1.5 rounded-lg border border-dashed border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {importing ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Importing…
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import File
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_ATTR}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {importError && (
          <p className="text-xs text-red-500">{importError}</p>
        )}

        <p className="text-xs text-gray-400 dark:text-gray-500">
          Supports PDF, DOCX, DOC, PPTX, TXT, MD — or just type / paste below
        </p>

        <textarea
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
          rows={8}
          placeholder="Write your notes here, or import a file above…"
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
