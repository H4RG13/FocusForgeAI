<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LessonPlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'title'            => $this->title,
            'subject'          => $this->subject,
            'grade_level'      => $this->grade_level,
            'description'      => $this->description,
            'duration_minutes' => $this->duration_minutes,
            'is_published'     => $this->is_published,
            'author'           => $this->whenLoaded('user', fn() => [
                'id'   => $this->user->id,
                'name' => $this->user->name,
            ]),
            'sections'         => LessonPlanSectionResource::collection($this->whenLoaded('sections')),
            'created_at'       => $this->created_at->toIso8601String(),
            'updated_at'       => $this->updated_at->toIso8601String(),
        ];
    }
}
