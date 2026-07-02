<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'note_id'        => $this->note_id,
            'title'          => $this->title,
            'quiz_type'      => $this->quiz_type ?? 'multiple_choice',
            'status'         => $this->status,
            'score'          => $this->score,
            'attempts_count' => $this->attempts_count,
            'questions'      => $this->whenLoaded('questions', fn() =>
                $this->questions->map(fn($q) => [
                    'id'          => $q->id,
                    'question'    => $q->question,
                    'options'     => $q->options,
                    'order_index' => $q->order_index,
                ])
            ),
            'created_at'     => $this->created_at,
        ];
    }
}
