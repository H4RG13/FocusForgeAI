<?php

namespace App\Http\Controllers\Api\Focus;

use App\Http\Controllers\Controller;
use App\Http\Resources\FocusSessionResource;
use App\Models\FocusSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FocusSessionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $sessions = FocusSession::where('user_id', $request->user()->id)
            ->with('task:id,title')
            ->latest('started_at')
            ->paginate(20);

        return response()->json(FocusSessionResource::collection($sessions)->response()->getData());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'task_id'          => 'nullable|integer|exists:tasks,id',
            'duration_minutes' => 'integer|min:1|max:120',
            'type'             => 'in:pomodoro,freeform',
            'notes'            => 'nullable|string|max:500',
        ]);

        $session = FocusSession::create([
            'user_id'          => $request->user()->id,
            'task_id'          => $data['task_id'] ?? null,
            'started_at'       => now(),
            'duration_minutes' => $data['duration_minutes'] ?? 25,
            'type'             => $data['type'] ?? 'pomodoro',
            'notes'            => $data['notes'] ?? null,
            'completed'        => false,
        ]);

        return response()->json(new FocusSessionResource($session), 201);
    }

    public function complete(Request $request, FocusSession $focusSession): JsonResponse
    {
        $this->authorize('update', $focusSession);

        $focusSession->update([
            'completed' => true,
            'ended_at'  => now(),
        ]);

        return response()->json(new FocusSessionResource($focusSession->fresh('task')));
    }

    public function abandon(Request $request, FocusSession $focusSession): JsonResponse
    {
        $this->authorize('update', $focusSession);

        $focusSession->update([
            'completed' => false,
            'ended_at'  => now(),
        ]);

        return response()->json(new FocusSessionResource($focusSession->fresh('task')));
    }

    public function destroy(FocusSession $focusSession): JsonResponse
    {
        $this->authorize('delete', $focusSession);
        $focusSession->delete();
        return response()->json(['message' => 'Session deleted.']);
    }
}
