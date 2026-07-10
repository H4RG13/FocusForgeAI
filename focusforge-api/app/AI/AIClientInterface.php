<?php

namespace App\AI;

interface AIClientInterface
{
    public function summarize(string $content, string $title): array;

    public function generateQuiz(string $title, string $content, int $questionCount = 5, string $quizType = 'multiple_choice'): array;

    public function chat(array $messages): array;

    public function generateStudyPlan(string $topic, string $context): array;

    public function parseLessonPlan(string $content): array;
}
