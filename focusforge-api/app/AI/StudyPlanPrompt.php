<?php

namespace App\AI;

class StudyPlanPrompt
{
    public function __construct(
        private readonly string $topic,
        private readonly string $context,
    ) {}

    public function inputHash(): string
    {
        return hash('sha256', $this->topic . '::' . $this->context);
    }
}
