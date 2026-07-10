'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { lessonPlanApi } from '@/lib/api/lessonPlans';
import { ROUTES } from '@/lib/constants/routes';
import TopBar from '@/components/layout/TopBar';
import LessonPlanForm from '@/components/features/lessonPlans/LessonPlanForm';

export default function NewLessonPlanPage() {
  const router = useRouter();

  const create = useMutation({
    mutationFn: lessonPlanApi.create,
    onSuccess: (plan) => router.push(ROUTES.LESSON_PLAN(plan.id)),
  });

  return (
    <div className="flex flex-col">
      <TopBar title="New Lesson Plan" />
      <div className="p-6 max-w-3xl">
        <LessonPlanForm
          onSubmit={create.mutateAsync}
          onCancel={() => router.push(ROUTES.LESSON_PLANS)}
          loading={create.isPending}
        />
      </div>
    </div>
  );
}
