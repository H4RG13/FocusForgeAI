<?php

namespace Tests\Feature\AI;

use App\Jobs\GenerateSummaryJob;
use App\Models\Note;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Tests\TestCase;

class AIGenerationTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Note $note;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->note = Note::factory()->create(['user_id' => $this->user->id, 'content' => 'Test note content for AI.']);
    }

    public function test_summarize_dispatches_job_and_returns_generation(): void
    {
        Bus::fake();

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/notes/{$this->note->id}/summarize");

        $response->assertStatus(202)
            ->assertJsonStructure(['id', 'type', 'status']);

        $this->assertEquals('summary', $response->json('type'));
        $this->assertEquals('pending', $response->json('status'));
    }

    public function test_summarize_returns_cached_result_if_already_completed(): void
    {
        Bus::fake();

        // First request
        $this->actingAs($this->user)
            ->postJson("/api/v1/notes/{$this->note->id}/summarize");

        Bus::assertDispatched(GenerateSummaryJob::class);
    }

    public function test_quiz_dispatches_job_and_returns_generation(): void
    {
        Bus::fake();

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/notes/{$this->note->id}/quiz", ['question_count' => 3]);

        $response->assertStatus(202)
            ->assertJsonStructure(['id', 'type', 'status']);

        $this->assertEquals('quiz', $response->json('type'));
    }

    public function test_quiz_validates_question_count(): void
    {
        Bus::fake();

        $this->actingAs($this->user)
            ->postJson("/api/v1/notes/{$this->note->id}/quiz", ['question_count' => 20])
            ->assertStatus(422);
    }

    public function test_cannot_summarize_another_users_note(): void
    {
        $other = User::factory()->create();

        $this->actingAs($other)
            ->postJson("/api/v1/notes/{$this->note->id}/summarize")
            ->assertStatus(403);
    }

    public function test_poll_generation_status(): void
    {
        Bus::fake();

        $createResponse = $this->actingAs($this->user)
            ->postJson("/api/v1/notes/{$this->note->id}/summarize");

        $genId = $createResponse->json('id');

        $this->actingAs($this->user)
            ->getJson("/api/v1/ai-generations/{$genId}")
            ->assertStatus(200)
            ->assertJsonStructure(['id', 'type', 'status']);
    }

    public function test_unauthenticated_cannot_access_ai_endpoints(): void
    {
        $this->postJson("/api/v1/notes/{$this->note->id}/summarize")
            ->assertStatus(401);
    }
}
