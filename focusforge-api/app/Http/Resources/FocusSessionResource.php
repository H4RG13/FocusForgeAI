<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FocusSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'task_id'          => $this->task_id,
            'task'             => $this->whenLoaded('task', fn() => [
                'id'    => $this->task->id,
                'title' => $this->task->title,
            ]),
            'duration_minutes' => $this->duration_minutes,
            'type'             => $this->type,
            'completed'        => $this->completed,
            'notes'            => $this->notes,
            'started_at'       => $this->started_at?->toIso8601String(),
            'ended_at'         => $this->ended_at?->toIso8601String(),
            'created_at'       => $this->created_at->toIso8601String(),
        ];
    }
}
