<?php

namespace App\AI;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class GroqClient implements AIClientInterface
{
    private string $apiKey;
    private string $baseUrl  = 'https://api.groq.com/openai/v1';
    private string $model    = 'llama-3.3-70b-versatile';
    private string $fastModel = 'llama-3.3-70b-versatile';

    public function __construct()
    {
        $this->apiKey = config('services.groq.key') ?? '';
    }

    // ------------------------------------------------------------------ chat

    public function chat(array $messages): array
    {
        $system = [
            'role'    => 'system',
            'content' => 'You are FocusForge AI, a helpful study and productivity assistant. '
                . 'Help users with study strategies, the Pomodoro technique, note-taking, '
                . 'focus techniques, and learning plans. Be concise and encouraging. '
                . 'Format responses with markdown when helpful.',
        ];

        $response = $this->request('chat/completions', [
            'model'       => $this->fastModel,
            'messages'    => array_merge([$system], $messages),
            'max_tokens'  => 512,
            'temperature' => 0.7,
        ]);

        $choice = $response['choices'][0]['message']['content'] ?? '';
        $usage  = $response['usage'] ?? [];

        return [
            'content'           => $choice,
            'prompt_tokens'     => $usage['prompt_tokens'] ?? 0,
            'completion_tokens' => $usage['completion_tokens'] ?? 0,
            'model'             => $response['model'] ?? $this->fastModel,
        ];
    }

    // --------------------------------------------------------------- summarize

    public function summarize(string $title, string $content): array
    {
        $content  = $this->truncateContent($content, 3000); // ~4 000 tokens input

        $messages = [
            [
                'role'    => 'system',
                'content' => 'You are a study assistant. Summarize notes clearly and concisely. '
                    . 'Return a markdown summary followed by 3-5 bullet key points.',
            ],
            [
                'role'    => 'user',
                'content' => "Summarize this note.\n\nTitle: {$title}\n\nContent:\n{$content}",
            ],
        ];

        $response = $this->request('chat/completions', [
            'model'       => $this->model,
            'messages'    => $messages,
            'max_tokens'  => 600,
            'temperature' => 0.5,
        ]);

        $text   = $response['choices'][0]['message']['content'] ?? '';
        $usage  = $response['usage'] ?? [];

        // Split summary from key points (heuristic: lines starting with - or *)
        $lines     = explode("\n", $text);
        $keyPoints = array_values(array_filter($lines, fn($l) => preg_match('/^\s*[-*•]/', $l)));
        $summary   = trim(implode("\n", array_filter($lines, fn($l) => !preg_match('/^\s*[-*•]/', $l))));

        return [
            'summary'           => $summary ?: $text,
            'key_points'        => array_map(fn($l) => trim(ltrim($l, '-*• ')), $keyPoints),
            'prompt_tokens'     => $usage['prompt_tokens'] ?? 0,
            'completion_tokens' => $usage['completion_tokens'] ?? 0,
            'model'             => $response['model'] ?? $this->model,
        ];
    }

    // ----------------------------------------------------------- generateQuiz

    public function generateQuiz(string $title, string $content, int $questionCount = 5, string $quizType = 'multiple_choice'): array
    {
        $content  = $this->truncateContent($content, 2000); // ~2 700 tokens — leaves room for 8k output

        $prompt   = new \App\AI\QuizPrompt($title, $content, $questionCount, $quizType);
        $messages = [
            ['role' => 'system', 'content' => $prompt->systemPrompt()],
            ['role' => 'user',   'content' => $prompt->userPrompt()],
        ];

        $response = $this->request('chat/completions', [
            'model'       => $this->model,
            'messages'    => $messages,
            'max_tokens'  => 8000,
            'temperature' => 0.4,
        ]);

        $raw   = $response['choices'][0]['message']['content'] ?? '{}';
        $usage = $response['usage'] ?? [];

        // Extract the JSON object — find the first { and last } to handle any wrapping text
        $start = strpos($raw, '{');
        $end   = strrpos($raw, '}');
        if ($start !== false && $end !== false && $end > $start) {
            $raw = substr($raw, $start, $end - $start + 1);
        }
        $data = json_decode($raw, true) ?? [];

        return array_merge($data, [
            'title'             => $data['title'] ?? "Quiz: {$title}",
            'questions'         => $data['questions'] ?? [],
            'prompt_tokens'     => $usage['prompt_tokens'] ?? 0,
            'completion_tokens' => $usage['completion_tokens'] ?? 0,
            'model'             => $response['model'] ?? $this->model,
        ]);
    }

    // ------------------------------------------------------- generateStudyPlan

    public function generateStudyPlan(string $topic, string $context): array
    {
        $contextPart = $context ? "\n\nContext / current knowledge:\n{$context}" : '';

        $messages = [
            [
                'role'    => 'system',
                'content' => 'You are a study planner. Create clear, actionable study plans in markdown. '
                    . 'Include weekly goals, Pomodoro session recommendations, and review strategies.',
            ],
            [
                'role'    => 'user',
                'content' => "Create a 3-week study plan for: {$topic}{$contextPart}",
            ],
        ];

        $response = $this->request('chat/completions', [
            'model'       => $this->model,
            'messages'    => $messages,
            'max_tokens'  => 800,
            'temperature' => 0.6,
        ]);

        $plan  = $response['choices'][0]['message']['content'] ?? '';
        $usage = $response['usage'] ?? [];

        return [
            'plan'              => $plan,
            'prompt_tokens'     => $usage['prompt_tokens'] ?? 0,
            'completion_tokens' => $usage['completion_tokens'] ?? 0,
            'model'             => $response['model'] ?? $this->model,
        ];
    }

    // ---------------------------------------------------------------- helpers

    /**
     * Truncate content to a safe word count so the total request stays
     * under Groq's free-tier 12 000 TPM limit.
     * ~1.33 tokens/word on average; leave headroom for system prompt + output.
     */
    private function truncateContent(string $content, int $maxWords): string
    {
        $words = preg_split('/\s+/', trim($content));
        if (count($words) <= $maxWords) {
            return $content;
        }
        return implode(' ', array_slice($words, 0, $maxWords))
            . "\n\n[Content truncated to fit token limit.]";
    }

    private function request(string $endpoint, array $payload): array
    {
        if (empty($this->apiKey)) {
            throw new RuntimeException('GROQ_API_KEY is not set.');
        }

        $response = Http::withToken($this->apiKey)
            ->withoutVerifying()
            ->timeout(30)
            ->post("{$this->baseUrl}/{$endpoint}", $payload);

        if ($response->failed()) {
            throw new RuntimeException('Groq API error: ' . $response->body());
        }

        return $response->json();
    }
}
