'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lessonPlanApi } from '@/lib/api/lessonPlans';
import { useAuthStore } from '@/store/auth.store';
import { LessonPlan } from '@/types/domain.types';
import { ROUTES } from '@/lib/constants/routes';
import TopBar from '@/components/layout/TopBar';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EmptyState from '@/components/shared/EmptyState';
import { ListSkeleton } from '@/components/shared/LoadingSkeleton';

export default function LessonPlansPage() {
  const router      = useRouter();
  const user        = useAuthStore(s => s.user);
  const qc          = useQueryClient();
  const isTeacher   = user?.role === 'teacher' || user?.role === 'admin';

  const [deleteTarget, setDeleteTarget] = useState<LessonPlan | null>(null);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['lesson-plans', search],
    queryFn: () => lessonPlanApi.list({ search: search || undefined }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['lesson-plans'] });

  const publish   = useMutation({ mutationFn: lessonPlanApi.publish,   onSuccess: invalidate });
  const unpublish = useMutation({ mutationFn: lessonPlanApi.unpublish, onSuccess: invalidate });
  const destroy   = useMutation({ mutationFn: lessonPlanApi.destroy,   onSuccess: invalidate });

  const plans: LessonPlan[] = (data as any)?.data ?? [];

  return (
    <div className="flex flex-col">
      <TopBar title="Lesson Plans" />
      <div className="p-6 space-y-4">

        {/* Header row */}
        <div className="flex items-center justify-between gap-3">
          <input
            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
            placeholder="Search lesson plans…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {isTeacher && (
            <Button size="sm" onClick={() => router.push(ROUTES.LESSON_PLAN_NEW)}>
              + New Plan
            </Button>
          )}
        </div>

        {/* List */}
        {isLoading ? (
          <ListSkeleton count={4} />
        ) : plans.length === 0 ? (
          <EmptyState
            title={isTeacher ? 'No lesson plans yet' : 'No published lesson plans yet'}
            description={isTeacher ? 'Create your first lesson plan to share with students.' : 'Check back later — teachers will publish plans here.'}
            action={isTeacher ? <Button size="sm" onClick={() => router.push(ROUTES.LESSON_PLAN_NEW)}>+ New Plan</Button> : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map(plan => (
              <div
                key={plan.id}
                className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
              >
                {/* Title + badges */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3
                    className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                    onClick={() => router.push(ROUTES.LESSON_PLAN(plan.id))}
                  >
                    {plan.title}
                  </h3>
                  <Badge color={plan.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                    {plan.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Badge color="bg-indigo-50 text-indigo-600">{plan.subject}</Badge>
                  <Badge color="bg-amber-50 text-amber-700">{plan.grade_level}</Badge>
                  <span className="text-xs text-gray-400 dark:text-gray-500 self-center">{plan.duration_minutes} min</span>
                </div>

                {plan.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 flex-1">{plan.description}</p>
                )}

                {plan.author && !isTeacher && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">By {plan.author.name}</p>
                )}

                {/* Actions */}
                <div className="mt-auto flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <Button size="sm" variant="ghost" onClick={() => router.push(ROUTES.LESSON_PLAN(plan.id))}>
                    View
                  </Button>
                  {isTeacher && (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => router.push(ROUTES.LESSON_PLAN_EDIT(plan.id))}>
                        Edit
                      </Button>
                      {plan.is_published ? (
                        <Button size="sm" variant="ghost" onClick={() => unpublish.mutate(plan.id)} loading={unpublish.isPending}>
                          Unpublish
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => publish.mutate(plan.id)} loading={publish.isPending}>
                          Publish
                        </Button>
                      )}
                      <Button size="sm" variant="danger" onClick={() => setDeleteTarget(plan)}>
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            destroy.mutate(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Delete Lesson Plan"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={destroy.isPending}
      />
    </div>
  );
}
