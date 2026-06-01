<?php

namespace App\Jobs;

use App\Mail\AIGenerationCompletedMail;
use App\Models\AIGeneration;
use App\Services\AIService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class GenerateStudyPlanJob implements ShouldQueue
{
    use Queueable;

    public int $tries   = 3;
    public int $timeout = 60;

    public function __construct(
        public readonly AIGeneration $generation,
        public readonly string $topic,
        public readonly string $context,
    ) {}

    public function handle(AIService $aiService): void
    {
        $aiService->processStudyPlan($this->generation, $this->topic, $this->context);

        if ($this->generation->fresh()->status === 'completed') {
            $user = $this->generation->user;
            Mail::to($user->email)->queue(new AIGenerationCompletedMail($user, $this->generation));
        }
    }

    public function failed(\Throwable $e): void
    {
        $this->generation->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
    }
}
