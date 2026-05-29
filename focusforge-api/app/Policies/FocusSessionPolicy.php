<?php

namespace App\Policies;

use App\Models\FocusSession;
use App\Models\User;

class FocusSessionPolicy
{
    public function update(User $user, FocusSession $session): bool
    {
        return $user->id === $session->user_id;
    }

    public function delete(User $user, FocusSession $session): bool
    {
        return $user->id === $session->user_id;
    }
}
