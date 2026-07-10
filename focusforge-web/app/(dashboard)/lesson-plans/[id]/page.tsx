'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lessonPlanApi } from '@/lib/api/lessonPlans';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/lib/constants/routes';
import TopBar from '@/components/layout/TopBar';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Skeleton } from '@/components/shared/LoadingSkeleton';

const SECTION_LABELS: Record<string, string> = {
  introduction: 'Introduction',
  activity:     'Activity',
  discussion:   'Discussion',
  assessment:   'Assessment',
  wrap_up:      'Wrap Up',
};

const SECTION_COLORS: Record<string, string> = {
  introduction: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
  activity:     'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
  discussion:   'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
  assessment:   'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800',
  wrap_up:      'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700',
};

export default function LessonPlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const user    = useAuthStore(s => s.user);
  const qc      = useQueryClient();
  const isOwnerOrAdmin = (authorId?: number) =>
    user?.role === 'admin' || user?.id === authorId;

  const { data: plan, isLoading } = useQuery({
    queryKey: ['lesson-plan', id],
    queryFn: () => lessonPlanApi.get(Number(id)),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['lesson-plan', id] });

  const publish   = useMutation({ mutationFn: () => lessonPlanApi.publish(Number(id)),   onSuccess: invalidate });
  const unpublish = useMutation({ mutationFn: () => lessonPlanApi.unpublish(Number(id)), onSuccess: invalidate });

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <TopBar title="Lesson Plan" />
        <div className="p-6 max-w-3xl space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="flex flex-col">
      <TopBar title={plan.title} />
      <div className="p-6 max-w-3xl space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge color="bg-indigo-50 text-indigo-600">{plan.subject}</Badge>
              <Badge color="bg-amber-50 text-amber-700">{plan.grade_level}</Badge>
              <Badge color="bg-gray-100 text-gray-600">{plan.duration_minutes} min</Badge>
              <Badge color={plan.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                {plan.is_published ? 'Published' : 'Draft'}
              </Badge>
            </div>
            {plan.author && (
              <p className="text-sm text-gray-500 dark:text-gray-400">By {plan.author.name}</p>
            )}
          </div>

          {isOwnerOrAdmin(plan.author?.id) && (
            <div className="flex shrink-0 gap-2">
              <Button size="sm" variant="ghost" onClick={() => router.push(ROUTES.LESSON_PLAN_EDIT(plan.id))}>
                Edit
              </Button>
              {plan.is_published ? (
                <Button size="sm" variant="ghost" onClick={() => unpublish.mutate()} loading={unpublish.isPending}>
                  Unpublish
                </Button>
              ) : (
                <Button size="sm" onClick={() => publish.mutate()} loading={publish.isPending}>
                  Publish
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        {plan.description && (
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Overview</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{plan.description}</p>
          </div>
        )}

        {/* Sections */}
        {plan.sections && plan.sections.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Lesson Sections</h2>
            {plan.sections.map((section, i) => (
              <div key={section.id} className={`rounded-xl border p-4 ${SECTION_COLORS[section.type]}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {i + 1}. {SECTION_LABELS[section.type] ?? section.type}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{section.content}</p>
              </div>
            ))}
          </div>
        )}

        {!plan.sections?.length && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No sections added yet.</p>
        )}

        {/* Back */}
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.LESSON_PLANS)}>
            ← Back to Lesson Plans
          </Button>
        </div>
      </div>
    </div>
  );
}
