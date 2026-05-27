<?php

namespace Tests\Feature\Note;

use App\Models\Note;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NoteTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_user_can_list_their_notes(): void
    {
        Note::factory(3)->create(['user_id' => $this->user->id]);
        Note::factory()->create(); // another user's note

        $response = $this->actingAs($this->user)->getJson('/api/v1/notes');

        $response->assertStatus(200)
                 ->assertJsonCount(3, 'data');
    }

    public function test_user_can_create_a_note(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/v1/notes', [
            'title'   => 'My Study Notes',
            'content' => 'These are my notes about chapter one.',
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('data.title', 'My Study Notes');

        $this->assertDatabaseHas('notes', [
            'title'   => 'My Study Notes',
            'user_id' => $this->user->id,
        ]);
    }

    public function test_word_count_is_calculated_on_create(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/v1/notes', [
            'title'   => 'Word Count Test',
            'content' => 'one two three four five',
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('data.word_count', 5);
    }

    public function test_user_can_update_their_note(): void
    {
        $note = Note::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)->putJson("/api/v1/notes/{$note->id}", [
            'title' => 'Updated Title',
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('data.title', 'Updated Title');
    }

    public function test_user_cannot_view_another_users_note(): void
    {
        $otherNote = Note::factory()->create();

        $this->actingAs($this->user)
             ->getJson("/api/v1/notes/{$otherNote->id}")
             ->assertStatus(403);
    }

    public function test_user_can_delete_their_note(): void
    {
        $note = Note::factory()->create(['user_id' => $this->user->id]);

        $this->actingAs($this->user)
             ->deleteJson("/api/v1/notes/{$note->id}")
             ->assertStatus(204);

        $this->assertDatabaseMissing('notes', ['id' => $note->id]);
    }
}
