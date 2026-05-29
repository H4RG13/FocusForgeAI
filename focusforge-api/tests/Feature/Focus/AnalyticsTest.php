<?php

namespace Tests\Feature\Focus;

use App\Models\FocusSession;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();

        // Seed some focus sessions
        FocusSession::create(['user_id' => $this->user->id, 'started_at' => now()->subHour(), 'duration_minutes' => 25, 'completed' => true]);
        FocusSession::create(['user_id' => $this->user->id, 'started_at' => now()->subHours(2), 'duration_minutes' => 25, 'completed' => true]);

        // Seed a completed task
        Task::factory()->create(['user_id' => $this->user->id, 'status' => 'done', 'completed_at' => now()]);
    }

    public function test_can_get_analytics_overview(): void
    {
        $this->actingAs($this->user)
            ->getJson('/api/v1/analytics/overview')
            ->assertStatus(200)
            ->assertJsonStructure([
                'tasks_completed', 'tasks_total',
                'focus_sessions_total', 'focus_minutes_total',
                'focus_hours_total', 'current_streak',
            ]);
    }

    public function test_overview_returns_correct_counts(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/analytics/overview');

        $response->assertJson([
            'focus_sessions_total' => 2,
            'focus_minutes_total'  => 50,
            'tasks_completed'      => 1,
        ]);
    }

    public function test_can_get_focus_by_day(): void
    {
        $this->actingAs($this->user)
            ->getJson('/api/v1/analytics/focus?days=7')
            ->assertStatus(200)
            ->assertJsonCount(7);
    }

    public function test_can_get_task_completion_by_day(): void
    {
        $this->actingAs($this->user)
            ->getJson('/api/v1/analytics/tasks?days=7')
            ->assertStatus(200)
            ->assertJsonCount(7);
    }

    public function test_can_get_heatmap(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/analytics/heatmap?weeks=4')
            ->assertStatus(200);

        $data = $response->json();
        $this->assertIsArray($data);
        $this->assertGreaterThan(0, count($data));
        $this->assertArrayHasKey('date', $data[0]);
        $this->assertArrayHasKey('level', $data[0]);
    }

    public function test_unauthenticated_cannot_access_analytics(): void
    {
        $this->getJson('/api/v1/analytics/overview')->assertStatus(401);
    }
}
