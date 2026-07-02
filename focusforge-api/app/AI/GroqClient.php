<?php

namespace App\AI;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class GroqClient implements AIClientInterface
{
    private string $apiKey;
    private string $baseUrl  = 'https://api.groq.com/openai/v1';
    private string $model    = 'llama3-8b-8192';
    private string $fastModel = 'llama3-8b-8192';

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

    public function generateQuiz(string $title, string $content, int $questionCount = 5): array
    {
        $messages = [
            [
                'role'    => 'system',
                'content' => 'You are a quiz generator. Always respond with valid JSON only — no markdown, no extra text.',
            ],
            [
                'role'    => 'user',
                'content' => "Generate a {$questionCount}-question multiple-choice quiz for this note.\n\n"
                    . "Title: {$title}\nContent:\n{$content}\n\n"
                    . 'Return JSON in this exact shape: '
                    . '{"title":"...","questions":[{"question":"...","options":["A","B","C","D"],'
                    . '"correct_answer":"A","explanation":"...","order_index":1}]}',
            ],
        ];

        $response = $this->request('chat/completions', [
            'model'       => $this->model,
            'messages'    => $messages,
            'max_tokens'  => 1200,
            'temperature' => 0.4,
        ]);

        $raw   = $response['choices'][0]['message']['content'] ?? '{}';
        $usage = $response['usage'] ?? [];

        // Strip any accidental markdown fences
        $raw   = preg_replace('/^```json?\s*/i', '', trim($raw));
        $raw   = preg_replace('/```$/', '', trim($raw));
        $data  = json_decode($raw, true) ?? [];

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

    private function request(string $endpoint, array $payload): array
    {
        if (empty($this->apiKey)) {
            throw new RuntimeException('GROQ_API_KEY is not set.');
        }

        $response = Http::withToken($this->apiKey)
            ->timeout(30)
            ->post("{$this->baseUrl}/{$endpoint}", $payload);

        if ($response->failed()) {
            throw new RuntimeException('Groq API error: ' . $response->body());
        }

        return $response->json();
    }
}
