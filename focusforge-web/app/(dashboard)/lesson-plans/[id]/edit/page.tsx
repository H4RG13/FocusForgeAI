'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lessonPlanApi } from '@/lib/api/lessonPlans';
import { ROUTES } from '@/lib/constants/routes';
import TopBar from '@/components/layout/TopBar';
import LessonPlanForm from '@/components/features/lessonPlans/LessonPlanForm';
import { Skeleton } from '@/components/shared/LoadingSkeleton';

export default function EditLessonPlanPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const qc      = useQueryClient();

  const { data: plan, isLoading } = useQuery({
    queryKey: ['lesson-plan', id],
    queryFn: () => lessonPlanApi.get(Number(id)),
  });

  const update = useMutation({
    mutationFn: (payload: any) => lessonPlanApi.update(Number(id), payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lesson-plan', id] });
      qc.invalidateQueries({ queryKey: ['lesson-plans'] });
      router.push(ROUTES.LESSON_PLAN(Number(id)));
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <TopBar title="Edit Lesson Plan" backHref={ROUTES.LESSON_PLAN(Number(id))} />
        <div className="p-6 max-w-3xl space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="flex flex-col">
      <TopBar title="Edit Lesson Plan" />
      <div className="p-6 max-w-3xl">
        <LessonPlanForm
          initial={plan}
          onSubmit={update.mutateAsync}
          onCancel={() => router.push(ROUTES.LESSON_PLAN(Number(id)))}
          loading={update.isPending}
        />
      </div>
    </div>
  );
}
