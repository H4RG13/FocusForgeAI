<?php

namespace App\Policies;

use App\Models\LessonPlan;
use App\Models\User;

class LessonPlanPolicy
{
    public function viewAny(User $user): bool
    {
        // Teachers and admins see their own plans; students browse published ones via a separate query
        return true;
    }

    public function view(User $user, LessonPlan $lessonPlan): bool
    {
        // Owner always can view; others only if published
        return $user->id === $lessonPlan->user_id || $lessonPlan->is_published;
    }

    public function create(User $user): bool
    {
        return $user->isTeacher() || $user->isAdmin();
    }

    public function update(User $user, LessonPlan $lessonPlan): bool
    {
        return $user->id === $lessonPlan->user_id || $user->isAdmin();
    }

    public function delete(User $user, LessonPlan $lessonPlan): bool
    {
        return $user->id === $lessonPlan->user_id || $user->isAdmin();
    }

    public function publish(User $user, LessonPlan $lessonPlan): bool
    {
        return $user->id === $lessonPlan->user_id || $user->isAdmin();
    }
}
