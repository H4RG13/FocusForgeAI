<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\QuizResource;
use App\Models\Note;
use App\Models\Quiz;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function index(Request $request, Note $note): JsonResponse
    {
        $this->authorize('view', $note);

        $quizzes = $note->quizzes()
            ->with('questions')
            ->latest()
            ->get();

        return response()->json(QuizResource::collection($quizzes));
    }

    public function show(Quiz $quiz): JsonResponse
    {
        $this->authorize('view', $quiz);

        return response()->json(new QuizResource($quiz->load('questions')));
    }

    public function submit(Request $request, Quiz $quiz): JsonResponse
    {
        $this->authorize('view', $quiz);

        $data = $request->validate([
            'answers'   => 'required|array',
            'answers.*' => 'required|string',
        ]);

        $questions = $quiz->questions;
        $correct   = 0;
        $results   = [];

        $textBased = in_array($quiz->quiz_type, ['identification', 'enumeration']);

        foreach ($questions as $question) {
            $given   = $data['answers'][$question->id] ?? null;
            $isRight = $textBased
                ? strtolower(trim((string) $given)) === strtolower(trim($question->correct_answer))
                : $given === $question->correct_answer;

            if ($isRight) {
                $correct++;
            }

            $results[] = [
                'question_id'    => $question->id,
                'question'       => $question->question,
                'given_answer'   => $given,
                'correct_answer' => $question->correct_answer,
                'is_correct'     => $isRight,
                'explanation'    => $question->explanation,
            ];
        }

        $score = $questions->count() > 0
            ? round(($correct / $questions->count()) * 100, 1)
            : 0;

        $quiz->increment('attempts_count');
        $quiz->update(['score' => $score, 'status' => 'completed']);

        return response()->json([
            'score'           => $score,
            'correct'         => $correct,
            'total'           => $questions->count(),
            'results'         => $results,
        ]);
    }
}
