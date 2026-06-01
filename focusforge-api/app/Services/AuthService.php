<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function register(array $data): array
    {
        $user = User::create([
            'name'                     => $data['name'],
            'email'                    => $data['email'],
            'password'                 => $data['password'],
            'timezone'                 => $data['timezone'] ?? 'UTC',
            'daily_focus_goal_minutes' => $data['daily_focus_goal_minutes'] ?? 120,
        ]);

        $token = $user->createToken('web-client')->plainTextToken;

        return compact('user', 'token');
    }

    public function login(string $email, string $password): array
    {
        if (! Auth::attempt(compact('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = Auth::user();
        $user->tokens()->delete();
        $token = $user->createToken('web-client')->plainTextToken;

        return compact('user', 'token');
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    public function resetPassword(array $data): string
    {
        return Password::reset($data, function (User $user, string $password) {
            $user->forceFill(['password' => Hash::make($password)])->save();
            $user->tokens()->delete();
        });
    }

    public function updateProfile(User $user, array $data): User
    {
        $user->update(array_filter($data, fn($v) => $v !== null));
        return $user->fresh();
    }
}
