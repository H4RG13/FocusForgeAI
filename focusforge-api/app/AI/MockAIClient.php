<?php

namespace App\AI;

/**
 * Swap this class for OpenAIClient (or AnthropicClient) once an API key is available.
 * Both must implement AIClientInterface — no other changes needed.
 */
class MockAIClient implements AIClientInterface
{
    public function summarize(string $content, string $title): array
    {
        // Simulate a short processing delay
        sleep(1);

        $wordCount = str_word_count($content);
        $sentences = $this->extractSentences($content, 3);

        return [
            'summary'          => "**{$title}**\n\n" . implode(' ', $sentences) . "\n\n*This note contains approximately {$wordCount} words covering the key concepts outlined above.*",
            'key_points'       => $this->extractKeyPoints($content),
            'prompt_tokens'    => (int) ($wordCount * 1.3),
            'completion_tokens'=> 120,
            'model'            => 'mock-gpt-4o-mini',
        ];
    }

    public function generateQuiz(string $title, string $content, int $questionCount = 5, string $quizType = 'multiple_choice'): array
    {
        sleep(1);

        $questions = [];
        $templates  = $this->quizTemplates($title);

        for ($i = 0; $i < min($questionCount, count($templates)); $i++) {
            $questions[] = array_merge($templates[$i], ['order_index' => $i + 1]);
        }

        return [
            'title'            => "Quiz: {$title}",
            'questions'        => $questions,
            'prompt_tokens'    => str_word_count($content),
            'completion_tokens'=> 300,
            'model'            => 'mock-gpt-4o-mini',
        ];
    }

    private function extractSentences(string $content, int $count): array
    {
        $sentences = preg_split('/(?<=[.!?])\s+/', strip_tags($content), -1, PREG_SPLIT_NO_EMPTY);
        return array_slice($sentences ?: ["This note covers important concepts."], 0, $count);
    }

    private function extractKeyPoints(string $content): array
    {
        $words    = str_word_count(strip_tags($content), 1);
        $unique   = array_unique(array_filter($words, fn($w) => strlen($w) > 5));
        $sample   = array_slice(array_values($unique), 0, 4);

        return array_map(fn($w) => "Key concept related to: {$w}", $sample)
            ?: ['Review the main concepts', 'Understand the core ideas', 'Apply the knowledge'];
    }

    public function chat(array $messages): array
    {
        $last = end($messages);
        $userMessage = $last['content'] ?? 'Hello';

        $reply = "I'm FocusForge AI, your study assistant! You asked: \"{$userMessage}\"\n\n"
            . "Here's what I can help you with:\n"
            . "- **Summarize** your notes for quick review\n"
            . "- **Generate quizzes** to test your understanding\n"
            . "- **Create study plans** based on your topics\n"
            . "- **Answer questions** about your study material\n\n"
            . "*Note: This is a mock AI response. Connect an OpenAI API key to enable real AI responses.*";

        return [
            'content'           => $reply,
            'prompt_tokens'     => str_word_count($userMessage) * 2,
            'completion_tokens' => 80,
            'model'             => 'mock-gpt-4o-mini',
        ];
    }

    public function generateStudyPlan(string $topic, string $context): array
    {
        sleep(1);

        return [
            'plan' => "# Study Plan: {$topic}\n\n"
                . "## Week 1 — Foundation\n"
                . "- Review core concepts and terminology\n"
                . "- Read introductory materials\n"
                . "- Complete 2 Pomodoro sessions (25 min each)\n\n"
                . "## Week 2 — Deep Dive\n"
                . "- Study advanced topics\n"
                . "- Practice with examples\n"
                . "- Take a quiz to assess understanding\n\n"
                . "## Week 3 — Application\n"
                . "- Apply concepts to real scenarios\n"
                . "- Review weak areas identified from quiz\n"
                . "- Final review session\n\n"
                . "## Tips\n"
                . "- Use the Pomodoro technique: 25 min focus, 5 min break\n"
                . "- Review notes within 24 hours of studying\n"
                . "- Generate a quiz after each session\n\n"
                . "*This is a mock study plan. Connect an OpenAI API key for personalized plans.*",
            'prompt_tokens'     => str_word_count($topic . $context),
            'completion_tokens' => 200,
            'model'             => 'mock-gpt-4o-mini',
        ];
    }

    private function quizTemplates(string $title): array
    {
        return [
            [
                'question'       => "What is the primary focus of \"{$title}\"?",
                'options'        => ['To introduce foundational concepts', 'To analyze advanced theories', 'To compare different methodologies', 'To review historical context'],
                'correct_answer' => 'To introduce foundational concepts',
                'explanation'    => 'The note primarily introduces and explains foundational concepts in this subject area.',
            ],
            [
                'question'       => "Which approach is most emphasized in \"{$title}\"?",
                'options'        => ['Theoretical framework', 'Practical application', 'Historical analysis', 'Comparative study'],
                'correct_answer' => 'Practical application',
                'explanation'    => 'The content focuses on practical application of the concepts discussed.',
            ],
            [
                'question'       => "What is a key takeaway from \"{$title}\"?",
                'options'        => ['Understanding core principles', 'Memorizing specific dates', 'Listing all related terms', 'Identifying exceptions only'],
                'correct_answer' => 'Understanding core principles',
                'explanation'    => 'The primary goal is to build a solid understanding of the core principles.',
            ],
            [
                'question'       => "How should the concepts in \"{$title}\" be applied?",
                'options'        => ['Contextually and critically', 'Rigidly and literally', 'Only in academic settings', 'Without further analysis'],
                'correct_answer' => 'Contextually and critically',
                'explanation'    => 'Concepts should always be applied with contextual awareness and critical thinking.',
            ],
            [
                'question'       => "What skill does studying \"{$title}\" primarily develop?",
                'options'        => ['Analytical thinking', 'Rote memorization', 'Speed reading', 'Data entry'],
                'correct_answer' => 'Analytical thinking',
                'explanation'    => 'Studying this topic develops analytical thinking and deeper comprehension skills.',
            ],
        ];
    }
}
