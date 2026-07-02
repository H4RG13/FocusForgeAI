<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AIGenerationResource;
use App\Models\AIGeneration;
use App\Models\Note;
use App\Services\AIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AIGenerationController extends Controller
{
    public function __construct(private readonly AIService $aiService) {}

    public function summarize(Request $request, Note $note): JsonResponse
    {
        $this->authorize('view', $note);

        $generation = $this->aiService->requestSummary($note, $request->user());

        return response()->json(new AIGenerationResource($generation), 202);
    }

    public function quiz(Request $request, Note $note): JsonResponse
    {
        $this->authorize('view', $note);

        $data = $request->validate([
            'question_count' => 'integer|min:3|max:100',
            'quiz_type'      => 'string|in:multiple_choice,true_false,identification,enumeration',
        ]);

        $generation = $this->aiService->requestQuiz(
            $note,
            $request->user(),
            $data['question_count'] ?? 5,
            $data['quiz_type'] ?? 'multiple_choice',
        );

        return response()->json(new AIGenerationResource($generation), 202);
    }

    public function chat(Request $request): JsonResponse
    {
        $data = $request->validate([
            'messages'         => ['required', 'array', 'min:1', 'max:20'],
            'messages.*.role'  => ['required', 'in:user,assistant'],
            'messages.*.content' => ['required', 'string', 'max:2000'],
        ]);

        $result = $this->aiService->chat($data['messages'], $request->user());

        return response()->json(['data' => $result]);
    }

    public function studyPlan(Request $request): JsonResponse
    {
        $data = $request->validate([
            'topic'   => ['required', 'string', 'max:255'],
            'context' => ['nullable', 'string', 'max:3000'],
        ]);

        $generation = $this->aiService->requestStudyPlan(
            $data['topic'],
            $data['context'] ?? '',
            $request->user()
        );

        return response()->json(new AIGenerationResource($generation), 202);
    }

    public function show(AIGeneration $aiGeneration): JsonResponse
    {
        $this->authorize('view', $aiGeneration);

        return response()->json(new AIGenerationResource($aiGeneration->load('generatable')));
    }
}
