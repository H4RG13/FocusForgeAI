<?php

namespace Tests\Feature\Focus;

use App\Models\FocusSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FocusSessionTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_can_list_focus_sessions(): void
    {
        FocusSession::create([
            'user_id'    => $this->user->id,
            'started_at' => now()->subHour(),
            'completed'  => true,
        ]);

        $this->actingAs($this->user)
            ->getJson('/api/v1/focus-sessions')
            ->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_can_start_a_focus_session(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/focus-sessions', [
                'duration_minutes' => 25,
                'type'             => 'pomodoro',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['id', 'duration_minutes', 'type', 'completed', 'started_at']);

        $this->assertEquals(false, $response->json('completed'));
    }

    public function test_can_complete_a_session(): void
    {
        $session = FocusSession::create([
            'user_id'    => $this->user->id,
            'started_at' => now()->subMinutes(25),
            'completed'  => false,
        ]);

        $this->actingAs($this->user)
            ->patchJson("/api/v1/focus-sessions/{$session->id}/complete")
            ->assertStatus(200)
            ->assertJson(['completed' => true]);

        $this->assertNotNull($session->fresh()->ended_at);
    }

    public function test_can_abandon_a_session(): void
    {
        $session = FocusSession::create([
            'user_id'    => $this->user->id,
            'started_at' => now()->subMinutes(10),
            'completed'  => false,
        ]);

        $this->actingAs($this->user)
            ->patchJson("/api/v1/focus-sessions/{$session->id}/abandon")
            ->assertStatus(200)
            ->assertJson(['completed' => false]);
    }

    public function test_can_delete_a_session(): void
    {
        $session = FocusSession::create([
            'user_id'    => $this->user->id,
            'started_at' => now(),
            'completed'  => false,
        ]);

        $this->actingAs($this->user)
            ->deleteJson("/api/v1/focus-sessions/{$session->id}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('focus_sessions', ['id' => $session->id]);
    }

    public function test_cannot_complete_another_users_session(): void
    {
        $other   = User::factory()->create();
        $session = FocusSession::create([
            'user_id'    => $other->id,
            'started_at' => now(),
            'completed'  => false,
        ]);

        $this->actingAs($this->user)
            ->patchJson("/api/v1/focus-sessions/{$session->id}/complete")
            ->assertStatus(403);
    }

    public function test_unauthenticated_cannot_access_focus_sessions(): void
    {
        $this->getJson('/api/v1/focus-sessions')->assertStatus(401);
    }
}
