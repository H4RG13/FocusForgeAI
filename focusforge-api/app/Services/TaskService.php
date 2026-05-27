<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class TaskService
{
    public function listForUser(User $user, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Task::forUser($user->id)->with('category');

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (! empty($filters['due_before'])) {
            $query->where('due_date', '<=', $filters['due_before']);
        }

        return $query->latest()->paginate($perPage);
    }

    public function todayForUser(User $user): Collection
    {
        return Task::forUser($user->id)->dueToday()->with('category')->get();
    }

    public function overdueForUser(User $user): Collection
    {
        return Task::forUser($user->id)->overdue()->with('category')->get();
    }

    public function create(User $user, array $data): Task
    {
        $task = Task::create([...$data, 'user_id' => $user->id]);
        return $task->load('category');
    }

    public function update(Task $task, array $data): Task
    {
        if (isset($data['status']) && $data['status'] === 'done' && ! $task->completed_at) {
            $data['completed_at'] = now();
        } elseif (isset($data['status']) && $data['status'] !== 'done') {
            $data['completed_at'] = null;
        }

        $task->update($data);
        return $task->fresh('category');
    }

    public function complete(Task $task): Task
    {
        $task->update(['status' => 'done', 'completed_at' => now()]);
        return $task->fresh('category');
    }

    public function delete(Task $task): void
    {
        $task->delete();
    }
}
