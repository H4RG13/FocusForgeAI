<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AdminUserResource;
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

        $user->update(['role' => 'user']);
        return response()->json(['message' => "User {$user->name} demoted to user."]);
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
