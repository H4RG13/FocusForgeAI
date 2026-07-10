<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AdminUserResource;
use App\Models\RoleAuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::query()
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%"))
            ->when($request->role, fn($q, $r) => $q->where('role', $r))
            ->withCount(['tasks', 'notes'])
            ->latest()
            ->paginate(20);

        return response()->json(AdminUserResource::collection($users)->response()->getData());
    }

    public function show(User $user): JsonResponse
    {
        $user->loadCount(['tasks', 'notes', 'quizzes', 'aiGenerations']);
        return response()->json(new AdminUserResource($user));
    }

    public function assignRole(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'role' => ['required', 'in:student,teacher,admin'],
        ]);

        $admin = $request->user();

        if ($user->id === $admin->id) {
            return response()->json(['message' => 'You cannot change your own role.'], 422);
        }

        if ($user->role === 'admin' && $request->role !== 'admin') {
            return response()->json(['message' => 'You cannot change another admin\'s role.'], 422);
        }

        $oldRole = $user->role;
        $newRole = $request->role;

        if ($oldRole === $newRole) {
            return response()->json(['message' => "User {$user->name} already has the role '{$newRole}'."]);
        }

        $user->update(['role' => $newRole]);

        RoleAuditLog::create([
            'target_user_id'    => $user->id,
            'changed_by_user_id' => $admin->id,
            'old_role'          => $oldRole,
            'new_role'          => $newRole,
        ]);

        if ($newRole !== 'student') {
            $user->tokens()->delete();
        }

        return response()->json([
            'message' => "Role updated: {$user->name} is now '{$newRole}'.",
            'data'    => new AdminUserResource($user),
        ]);
    }

    public function promote(User $user): JsonResponse
    {
        $user->update(['role' => 'admin']);
        return response()->json(['message' => "User {$user->name} promoted to admin."]);
    }

    public function demote(User $user): JsonResponse
    {
        if ($user->id === request()->user()->id) {
            return response()->json(['message' => 'You cannot demote yourself.'], 422);
        }

        $user->update(['role' => 'student']);
        return response()->json(['message' => "User {$user->name} demoted to student."]);
    }

    public function ban(User $user): JsonResponse
    {
        if ($user->id === request()->user()->id) {
            return response()->json(['message' => 'You cannot ban yourself.'], 422);
        }

        $user->tokens()->delete();
        $user->update(['banned_at' => now()]);

        return response()->json(['message' => "User {$user->name} has been banned."]);
    }

    public function unban(User $user): JsonResponse
    {
        $user->update(['banned_at' => null]);
        return response()->json(['message' => "User {$user->name} has been unbanned."]);
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->id === request()->user()->id) {
            return response()->json(['message' => 'You cannot delete yourself.'], 422);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted.'], 200);
    }
}
