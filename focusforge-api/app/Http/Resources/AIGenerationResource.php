<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AIGenerationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'type'              => $this->type,
            'status'            => $this->status,
            'model'             => $this->model,
            'result'            => $this->result,
            'error_message'     => $this->when($this->status === 'failed', $this->error_message),
            'prompt_tokens'     => $this->prompt_tokens,
            'completion_tokens' => $this->completion_tokens,
            'created_at'        => $this->created_at,
            'updated_at'        => $this->updated_at,
        ];
    }
}
