<?php

namespace App\AI;

class QuizPrompt
{
    public const TYPES = ['multiple_choice', 'true_false', 'identification', 'enumeration'];

    public function __construct(
        private readonly string $title,
        private readonly string $content,
        private readonly int    $questionCount = 5,
        private readonly string $quizType      = 'multiple_choice',
    ) {}

    public function systemPrompt(): string
    {
        return match ($this->quizType) {
            'true_false'     => $this->trueFalseSystem(),
            'identification' => $this->identificationSystem(),
            'enumeration'    => $this->enumerationSystem(),
            default          => $this->multipleChoiceSystem(),
        };
    }

    public function userPrompt(): string
    {
        return "Generate {$this->questionCount} questions.\n\nTitle: {$this->title}\n\nContent:\n{$this->content}";
    }

    public function inputHash(): string
    {
        return hash('sha256', $this->title . '::' . $this->content . '::' . $this->questionCount . '::' . $this->quizType);
    }

    // ----------------------------------------------------------------- prompts

    private function multipleChoiceSystem(): string
    {
        return <<<PROMPT
You are an expert educator. Generate a multiple-choice quiz from the provided note.
Each question must:
- Have exactly 4 answer options (stored as plain text in the options array)
- Have one clearly correct answer stored as the LETTER "A", "B", "C", or "D" (matching the index: A=options[0], B=options[1], C=options[2], D=options[3])
- Include a brief explanation of why the answer is correct
- Be directly based on the note content
Return ONLY valid JSON — no markdown, no extra text:
{
  "title": "Multiple Choice: <note title>",
  "questions": [
    {
      "question": "...",
      "options": ["option A text", "option B text", "option C text", "option D text"],
      "correct_answer": "A",
      "explanation": "...",
      "order_index": 1
    }
  ]
}
PROMPT;
    }

    private function trueFalseSystem(): string
    {
        return <<<PROMPT
You are an expert educator. Generate a True/False quiz from the provided note.
Each question must:
- Be a clear statement that is either true or false based on the note
- Have options: ["True", "False"]
- Have correct_answer as "A" for True or "B" for False
- Include a brief explanation
Return ONLY valid JSON — no markdown, no extra text:
{
  "title": "True/False: <note title>",
  "questions": [
    {
      "question": "...",
      "options": ["True", "False"],
      "correct_answer": "A",
      "explanation": "...",
      "order_index": 1
    }
  ]
}
PROMPT;
    }

    private function identificationSystem(): string
    {
        return <<<PROMPT
You are an expert educator. Generate an identification quiz from the provided note.
Each question must:
- Ask the student to identify a specific term, name, concept, or value from the note
- Have an empty options array []
- Have correct_answer as the exact short text answer (1-5 words)
- Include a brief explanation
Return ONLY valid JSON — no markdown, no extra text:
{
  "title": "Identification: <note title>",
  "questions": [
    {
      "question": "What is the term for ...?",
      "options": [],
      "correct_answer": "exact answer",
      "explanation": "...",
      "order_index": 1
    }
  ]
}
PROMPT;
    }

    private function enumerationSystem(): string
    {
        return <<<PROMPT
You are an expert educator. Generate an enumeration quiz from the provided note.
Each question must ask the student to name or list a specific numbered item from a list in the note.
- Have an empty options array []
- Have correct_answer as the exact short text answer
- Include a brief explanation
Return ONLY valid JSON — no markdown, no extra text:
{
  "title": "Enumeration: <note title>",
  "questions": [
    {
      "question": "What is the 1st step/item/principle of ...?",
      "options": [],
      "correct_answer": "exact answer",
      "explanation": "...",
      "order_index": 1
    }
  ]
}
PROMPT;
    }
}
