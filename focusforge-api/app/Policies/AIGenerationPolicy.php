<?php

namespace App\Policies;

use App\Models\AIGeneration;
use App\Models\User;

class AIGenerationPolicy
{
    public function view(User $user, AIGeneration $generation): bool
    {
        return $user->id === $generation->user_id;
    }
}
