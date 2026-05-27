<?php

namespace App\Services;

use App\Models\Note;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class NoteService
{
    public function listForUser(User $user, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Note::where('user_id', $user->id)->with('category');

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('title', 'like', "%{$filters['search']}%")
                  ->orWhere('content', 'like', "%{$filters['search']}%");
            });
        }

        return $query->latest()->paginate($perPage);
    }

    public function create(User $user, array $data): Note
    {
        $data['user_id']    = $user->id;
        $data['word_count'] = $this->countWords($data['content'] ?? '');

        return Note::create($data)->load('category');
    }

    public function update(Note $note, array $data): Note
    {
        if (isset($data['content'])) {
            $data['word_count'] = $this->countWords($data['content']);
        }

        $note->update($data);
        return $note->fresh('category');
    }

    public function delete(Note $note): void
    {
        $note->delete();
    }

    private function countWords(string $content): int
    {
        $plain = strip_tags($content);
        return str_word_count($plain);
    }
}
