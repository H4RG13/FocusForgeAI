<?php

namespace App\Services;

use App\AI\AIClientInterface;
use App\AI\QuizPrompt;
use App\AI\SummaryPrompt;
use App\Jobs\GenerateQuizJob;
use App\Jobs\GenerateSummaryJob;
use App\Models\AIGeneration;
use App\Models\Note;
use App\Models\Quiz;
use App\Models\User;

class AIService
{
    public function __construct(private readonly AIClientInterface $client) {}

    public function requestSummary(Note $note, User $user): AIGeneration
    {
        $prompt = new SummaryPrompt($note->title, $note->content ?? '');

        $existing = AIGeneration::where('input_hash', $prompt->inputHash())
            ->where('type', 'summary')
            ->where('status', 'completed')
            ->first();

        if ($existing) {
            return $existing;
        }

        $generation = AIGeneration::create([
            'user_id'          => $user->id,
            'generatable_id'   => $note->id,
            'generatable_type' => Note::class,
            'type'             => 'summary',
            'status'           => 'pending',
            'model'            => 'mock-gpt-4o-mini',
            'input_hash'       => $prompt->inputHash(),
        ]);

        GenerateSummaryJob::dispatch($generation, $note);

        return $generation;
    }

    public function requestQuiz(Note $note, User $user, int $questionCount = 5): AIGeneration
    {
        $prompt = new QuizPrompt($note->title, $note->content ?? '', $questionCount);

        $existing = AIGeneration::where('input_hash', $prompt->inputHash())
            ->where('type', 'quiz')
            ->where('status', 'completed')
            ->first();

        if ($existing) {
            return $existing;
        }

        $generation = AIGeneration::create([
            'user_id'          => $user->id,
            'generatable_id'   => $note->id,
            'generatable_type' => Note::class,
            'type'             => 'quiz',
            'status'           => 'pending',
            'model'            => 'mock-gpt-4o-mini',
            'input_hash'       => $prompt->inputHash(),
        ]);

        GenerateQuizJob::dispatch($generation, $note, $questionCount);

        return $generation;
    }

    public function processSummary(AIGeneration $generation, Note $note): void
    {
        $generation->update(['status' => 'processing']);

        try {
            $result = $this->client->summarize($note->title, $note->content ?? '');

            $generation->update([
                'status'            => 'completed',
                'result'            => ['summary' => $result['summary'], 'key_points' => $result['key_points']],
                'prompt_tokens'     => $result['prompt_tokens'],
                'completion_tokens' => $result['completion_tokens'],
                'model'             => $result['model'],
            ]);
        } catch (\Throwable $e) {
            $generation->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
        }
    }

    public function processQuiz(AIGeneration $generation, Note $note, int $questionCount): void
    {
        $generation->update(['status' => 'processing']);

        try {
            $result = $this->client->generateQuiz($note->title, $note->content ?? '', $questionCount);

            $generation->update([
                'status'            => 'completed',
                'result'            => $result,
                'prompt_tokens'     => $result['prompt_tokens'],
                'completion_tokens' => $result['completion_tokens'],
                'model'             => $result['model'],
            ]);

            $quiz = Quiz::create([
                'user_id'          => $generation->user_id,
                'note_id'          => $note->id,
                'ai_generation_id' => $generation->id,
                'title'            => $result['title'],
                'status'           => 'available',
            ]);

            foreach ($result['questions'] as $q) {
                $quiz->questions()->create([
                    'question'       => $q['question'],
                    'options'        => $q['options'],
                    'correct_answer' => $q['correct_answer'],
                    'explanation'    => $q['explanation'],
                    'order_index'    => $q['order_index'],
                ]);
            }
        } catch (\Throwable $e) {
            $generation->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
        }
    }
}
