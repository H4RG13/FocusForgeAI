'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { lessonPlanApi } from '@/lib/api/lessonPlans';
import { ROUTES } from '@/lib/constants/routes';
import TopBar from '@/components/layout/TopBar';
import LessonPlanForm from '@/components/features/lessonPlans/LessonPlanForm';
import Button from '@/components/ui/Button';
import type { LessonPlan } from '@/types/domain.types';

export default function NewLessonPlanPage() {
  const router      = useRouter();
  const fileRef     = useRef<HTMLInputElement>(null);
  const [importing, setImporting]   = useState(false);
  const [importErr, setImportErr]   = useState('');
  const [formKey,   setFormKey]     = useState(0);
  const [prefill,   setPrefill]     = useState<Partial<LessonPlan> | undefined>(undefined);

  const create = useMutation({
    mutationFn: lessonPlanApi.create,
    onSuccess: (plan) => router.push(ROUTES.LESSON_PLAN(plan.id)),
  });

  const handleImport = async (file: File) => {
    setImporting(true);
    setImportErr('');
    try {
      const data = await lessonPlanApi.importFile(file);
      setPrefill(data);
      setFormKey(k => k + 1);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Import failed. Check the file and try again.';
      setImportErr(msg);
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col">
      <TopBar title="New Lesson Plan" />
      <div className="p-6 max-w-3xl">

        {/* Import toolbar */}
        <div className="mb-5 flex items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
          <span className="text-sm text-gray-500 dark:text-gray-400 flex-1">
            {prefill
              ? <span className="text-green-600 dark:text-green-400 font-medium">✓ File imported — review and save below</span>
              : 'Have an existing lesson plan? Import a .docx, .txt, or .json file to pre-fill the form.'}
          </span>
          <input
            ref={fileRef}
            type="file"
            accept=".json,.docx,.txt"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleImport(e.target.files[0])}
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            loading={importing}
            onClick={() => fileRef.current?.click()}
          >
            Import file
          </Button>
        </div>

        {importErr && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {importErr}
          </p>
        )}

        <LessonPlanForm
          key={formKey}
          initial={prefill}
          onSubmit={create.mutateAsync}
          onCancel={() => router.push(ROUTES.LESSON_PLANS)}
          loading={create.isPending}
        />
      </div>
    </div>
  );
}
