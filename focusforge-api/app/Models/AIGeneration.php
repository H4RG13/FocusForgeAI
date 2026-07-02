<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable([
    'user_id', 'generatable_id', 'generatable_type',
    'type', 'status', 'prompt_tokens', 'completion_tokens',
    'model', 'input_hash', 'result', 'error_message',
])]
class AIGeneration extends Model
{
    use HasFactory;

    protected $table = 'ai_generations';

    protected function casts(): array
    {
        return [
            'result' => 'array',
        ];
    }

    public function generatable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function quiz(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Quiz::class, 'ai_generation_id');
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isPending(): bool
    {
        return in_array($this->status, ['pending', 'processing']);
    }
}
