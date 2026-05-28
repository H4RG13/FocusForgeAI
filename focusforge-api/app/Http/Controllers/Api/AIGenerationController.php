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
            'question_count' => 'integer|min:3|max:10',
        ]);

        $generation = $this->aiService->requestQuiz($note, $request->user(), $data['question_count'] ?? 5);

        return response()->json(new AIGenerationResource($generation), 202);
    }

    public function show(AIGeneration $aiGeneration): JsonResponse
    {
        $this->authorize('view', $aiGeneration);

        return response()->json(new AIGenerationResource($aiGeneration->load('generatable')));
    }
}
