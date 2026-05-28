<?php

namespace App\AI;

interface AIClientInterface
{
    public function summarize(string $content, string $title): array;

    public function generateQuiz(string $content, string $title, int $questionCount = 5): array;
}
