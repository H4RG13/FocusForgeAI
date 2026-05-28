<?php

namespace App\AI;

class QuizPrompt
{
    public function __construct(
        private readonly string $title,
        private readonly string $content,
        private readonly int $questionCount = 5,
    ) {}

    public function systemPrompt(): string
    {
        return <<<PROMPT
You are an expert educator. Generate a multiple-choice quiz from the provided note.
Each question must:
- Have exactly 4 answer options (A, B, C, D)
- Have one clearly correct answer
- Include a brief explanation of why the answer is correct
- Be directly based on the note content
Return JSON in this exact shape:
{
  "title": "Quiz: <note title>",
  "questions": [
    {
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correct_answer": "...",
      "explanation": "..."
    }
  ]
}
PROMPT;
    }

    public function userPrompt(): string
    {
        return "Generate {$this->questionCount} questions.\n\nTitle: {$this->title}\n\nContent:\n{$this->content}";
    }

    public function inputHash(): string
    {
        return hash('sha256', $this->title . '::' . $this->content . '::' . $this->questionCount);
    }
}
