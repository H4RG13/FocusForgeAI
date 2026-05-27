<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\TaskCollection;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TaskController extends Controller
{
    public function __construct(private readonly TaskService $taskService) {}

    public function index(Request $request): JsonResponse
    {
        $tasks = $this->taskService->listForUser(
            user: $request->user(),
            filters: $request->only(['status', 'priority', 'category_id', 'due_before']),
            perPage: $request->integer('per_page', 15),
        );

        return response()->json(new TaskCollection($tasks));
    }

    public function today(Request $request): JsonResponse
    {
        $tasks = $this->taskService->todayForUser($request->user());
        return response()->json(['data' => TaskResource::collection($tasks)]);
    }

    public function overdue(Request $request): JsonResponse
    {
        $tasks = $this->taskService->overdueForUser($request->user());
        return response()->json(['data' => TaskResource::collection($tasks)]);
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = $this->taskService->create($request->user(), $request->validated());
        return response()->json(['data' => new TaskResource($task)], 201);
    }

    public function show(Request $request, Task $task): JsonResponse
    {
        $this->authorize('view', $task);
        return response()->json(['data' => new TaskResource($task->load('category'))]);
    }

    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);
        $task = $this->taskService->update($task, $request->validated());
        return response()->json(['data' => new TaskResource($task)]);
    }

    public function complete(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);
        $task = $this->taskService->complete($task);
        return response()->json(['data' => new TaskResource($task)]);
    }

    public function destroy(Request $request, Task $task): Response
    {
        $this->authorize('delete', $task);
        $this->taskService->delete($task);
        return response()->noContent();
    }
}
