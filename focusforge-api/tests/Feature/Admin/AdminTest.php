<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->user  = User::factory()->create(['role' => 'user']);
    }

    public function test_admin_can_view_stats(): void
    {
        $this->actingAs($this->admin)
            ->getJson('/api/v1/admin/stats')
            ->assertStatus(200)
            ->assertJsonStructure(['users', 'tasks', 'notes', 'ai']);
    }

    public function test_regular_user_cannot_access_admin_stats(): void
    {
        $this->actingAs($this->user)
            ->getJson('/api/v1/admin/stats')
            ->assertStatus(403);
    }

    public function test_unauthenticated_cannot_access_admin(): void
    {
        $this->getJson('/api/v1/admin/stats')
            ->assertStatus(401);
    }

    public function test_admin_can_list_users(): void
    {
        $this->actingAs($this->admin)
            ->getJson('/api/v1/admin/users')
            ->assertStatus(200)
            ->assertJsonStructure(['data', 'meta']);
    }

    public function test_admin_can_view_user(): void
    {
        $this->actingAs($this->admin)
            ->getJson("/api/v1/admin/users/{$this->user->id}")
            ->assertStatus(200)
            ->assertJson(['id' => $this->user->id, 'email' => $this->user->email]);
    }

    public function test_admin_can_promote_user_to_admin(): void
    {
        $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/users/{$this->user->id}/promote")
            ->assertStatus(200);

        $this->assertEquals('admin', $this->user->fresh()->role);
    }

    public function test_admin_can_demote_admin_to_user(): void
    {
        $other = User::factory()->create(['role' => 'admin']);

        $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/users/{$other->id}/demote")
            ->assertStatus(200);

        $this->assertEquals('user', $other->fresh()->role);
    }

    public function test_admin_cannot_demote_themselves(): void
    {
        $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/users/{$this->admin->id}/demote")
            ->assertStatus(422);
    }

    public function test_admin_can_ban_user(): void
    {
        $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/users/{$this->user->id}/ban")
            ->assertStatus(200);

        $this->assertNotNull($this->user->fresh()->banned_at);
    }

    public function test_admin_cannot_ban_themselves(): void
    {
        $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/users/{$this->admin->id}/ban")
            ->assertStatus(422);
    }

    public function test_admin_can_unban_user(): void
    {
        $this->user->update(['banned_at' => now()]);

        $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/users/{$this->user->id}/unban")
            ->assertStatus(200);

        $this->assertNull($this->user->fresh()->banned_at);
    }

    public function test_admin_can_delete_user(): void
    {
        $this->actingAs($this->admin)
            ->deleteJson("/api/v1/admin/users/{$this->user->id}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('users', ['id' => $this->user->id]);
    }

    public function test_admin_cannot_delete_themselves(): void
    {
        $this->actingAs($this->admin)
            ->deleteJson("/api/v1/admin/users/{$this->admin->id}")
            ->assertStatus(422);
    }

    public function test_admin_can_search_users(): void
    {
        $this->actingAs($this->admin)
            ->getJson("/api/v1/admin/users?search={$this->user->name}")
            ->assertStatus(200)
            ->assertJsonPath('data.0.email', $this->user->email);
    }
}
