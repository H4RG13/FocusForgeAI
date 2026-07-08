<?php

namespace App\Jobs;

use App\Models\AIGeneration;
use App\Models\Note;
use App\Services\AIService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class GenerateQuizJob implements ShouldQueue
{
    use Queueable;

    public int $tries   = 3;
    public int $timeout = 60;

    public function __construct(
        public readonly AIGeneration $generation,
        public readonly Note $note,
        public readonly int    $questionCount = 5,
        public readonly string $quizType      = 'multiple_choice',
    ) {}

    public function handle(AIService $aiService): void
    {
        $aiService->processQuiz($this->generation, $this->note, $this->questionCount, $this->quizType);
    }

    public function failed(\Throwable $e): void
    {
        $this->generation->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
    }
}
