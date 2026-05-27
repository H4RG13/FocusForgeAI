<?php

namespace Tests\Feature\Task;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_user_can_list_their_tasks(): void
    {
        Task::factory(3)->create(['user_id' => $this->user->id]);
        Task::factory()->create(); // another user's task

        $response = $this->actingAs($this->user)->getJson('/api/v1/tasks');

        $response->assertStatus(200)
                 ->assertJsonCount(3, 'data');
    }

    public function test_user_can_create_a_task(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/v1/tasks', [
            'title'    => 'Study for exam',
            'priority' => 'high',
            'due_date' => '2026-06-01',
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('data.title', 'Study for exam')
                 ->assertJsonPath('data.priority', 'high');

        $this->assertDatabaseHas('tasks', [
            'title'   => 'Study for exam',
            'user_id' => $this->user->id,
        ]);
    }

    public function test_user_can_update_their_task(): void
    {
        $task = Task::factory()->create(['user_id' => $this->user->id, 'title' => 'Old title']);

        $response = $this->actingAs($this->user)->putJson("/api/v1/tasks/{$task->id}", [
            'title' => 'New title',
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('data.title', 'New title');
    }

    public function test_user_cannot_update_another_users_task(): void
    {
        $otherTask = Task::factory()->create();

        $this->actingAs($this->user)
             ->putJson("/api/v1/tasks/{$otherTask->id}", ['title' => 'Hacked'])
             ->assertStatus(403);
    }

    public function test_user_can_complete_a_task(): void
    {
        $task = Task::factory()->create(['user_id' => $this->user->id, 'status' => 'todo']);

        $response = $this->actingAs($this->user)->patchJson("/api/v1/tasks/{$task->id}/complete");

        $response->assertStatus(200)
                 ->assertJsonPath('data.status', 'done');

        $this->assertNotNull($task->fresh()->completed_at);
    }

    public function test_user_can_delete_their_task(): void
    {
        $task = Task::factory()->create(['user_id' => $this->user->id]);

        $this->actingAs($this->user)
             ->deleteJson("/api/v1/tasks/{$task->id}")
             ->assertStatus(204);

        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    public function test_user_cannot_delete_another_users_task(): void
    {
        $otherTask = Task::factory()->create();

        $this->actingAs($this->user)
             ->deleteJson("/api/v1/tasks/{$otherTask->id}")
             ->assertStatus(403);
    }
}
