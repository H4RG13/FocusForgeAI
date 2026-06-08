<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                       => $this->id,
            'name'                     => $this->name,
            'email'                    => $this->email,
            'role'                     => $this->role,
            'is_banned'                => $this->isBanned(),
            'banned_at'                => $this->banned_at?->toIso8601String(),
            'tasks_count'              => $this->whenCounted('tasks'),
            'notes_count'              => $this->whenCounted('notes'),
            'quizzes_count'            => $this->whenCounted('quizzes'),
            'ai_generations_count'     => $this->whenCounted('aiGenerations'),
            'email_verified_at'        => $this->email_verified_at?->toIso8601String(),
            'created_at'               => $this->created_at->toIso8601String(),
        ];
    }
}
