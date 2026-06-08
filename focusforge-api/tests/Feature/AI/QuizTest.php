<?php

namespace Tests\Feature\AI;

use App\Models\Note;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuizTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Note $note;
    private Quiz $quiz;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->note = Note::factory()->create(['user_id' => $this->user->id]);

        $this->quiz = Quiz::create([
            'user_id' => $this->user->id,
            'note_id' => $this->note->id,
            'title'   => 'Test Quiz',
            'status'  => 'available',
        ]);

        QuizQuestion::create([
            'quiz_id'        => $this->quiz->id,
            'question'       => 'What is 2 + 2?',
            'options'        => ['3', '4', '5', '6'],
            'correct_answer' => '4',
            'explanation'    => 'Basic arithmetic.',
            'order_index'    => 1,
        ]);
    }

    public function test_can_list_quizzes_for_note(): void
    {
        $this->actingAs($this->user)
            ->getJson("/api/v1/notes/{$this->note->id}/quizzes")
            ->assertStatus(200)
            ->assertJsonCount(1);
    }

    public function test_can_view_quiz_with_questions(): void
    {
        $this->actingAs($this->user)
            ->getJson("/api/v1/quizzes/{$this->quiz->id}")
            ->assertStatus(200)
            ->assertJsonStructure(['id', 'title', 'questions']);
    }

    public function test_can_submit_quiz_answers(): void
    {
        $question = $this->quiz->questions->first();

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/quizzes/{$this->quiz->id}/submit", [
                'answers' => [$question->id => '4'],
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['score', 'correct', 'total', 'results'])
            ->assertJson(['score' => 100.0, 'correct' => 1, 'total' => 1]);
    }

    public function test_submit_scores_incorrect_answers(): void
    {
        $question = $this->quiz->questions->first();

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/quizzes/{$this->quiz->id}/submit", [
                'answers' => [$question->id => '3'],
            ]);

        $response->assertStatus(200)
            ->assertJson(['score' => 0.0, 'correct' => 0]);
    }

    public function test_cannot_access_another_users_quiz(): void
    {
        $other = User::factory()->create();

        $this->actingAs($other)
            ->getJson("/api/v1/quizzes/{$this->quiz->id}")
            ->assertStatus(403);
    }

    public function test_submit_requires_answers(): void
    {
        $this->actingAs($this->user)
            ->postJson("/api/v1/quizzes/{$this->quiz->id}/submit", [])
            ->assertStatus(422);
    }
}
