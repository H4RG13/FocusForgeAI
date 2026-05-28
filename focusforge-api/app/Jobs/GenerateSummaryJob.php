<?php

namespace App\Jobs;

use App\Models\AIGeneration;
use App\Models\Note;
use App\Services\AIService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class GenerateSummaryJob implements ShouldQueue
{
    use Queueable;

    public int $tries   = 3;
    public int $timeout = 60;

    public function __construct(
        public readonly AIGeneration $generation,
        public readonly Note $note,
    ) {}

    public function handle(AIService $aiService): void
    {
        $aiService->processSummary($this->generation, $this->note);
    }

    public function failed(\Throwable $e): void
    {
        $this->generation->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
    }
}
