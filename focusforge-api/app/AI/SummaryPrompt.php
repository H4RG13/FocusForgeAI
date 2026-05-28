<?php

namespace App\AI;

class SummaryPrompt
{
    public function __construct(
        private readonly string $title,
        private readonly string $content,
    ) {}

    public function systemPrompt(): string
    {
        return <<<PROMPT
You are an expert study assistant. Summarize the provided note clearly and concisely.
Your summary must:
- Be written in markdown
- Start with the note title as a bold heading
- Include 3-5 bullet points of key takeaways
- End with a one-sentence conclusion
- Be no longer than 200 words
PROMPT;
    }

    public function userPrompt(): string
    {
        return "Title: {$this->title}\n\nContent:\n{$this->content}";
    }

    public function inputHash(): string
    {
        return hash('sha256', $this->title . '::' . $this->content);
    }
}
