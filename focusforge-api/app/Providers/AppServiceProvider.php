<?php

namespace App\Providers;

use App\AI\AIClientInterface;
use App\AI\GroqClient;
use App\AI\MockAIClient;
use App\Models\AIGeneration;
use App\Models\FocusSession;
use App\Models\Quiz;
use App\Policies\AIGenerationPolicy;
use App\Policies\FocusSessionPolicy;
use App\Policies\QuizPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(AIClientInterface::class, function () {
            return config('services.groq.key')
                ? new GroqClient()
                : new MockAIClient();
        });
    }

    public function boot(): void
    {
        Gate::policy(AIGeneration::class, AIGenerationPolicy::class);
        Gate::policy(Quiz::class, QuizPolicy::class);
        Gate::policy(FocusSession::class, FocusSessionPolicy::class);

        // Password reset emails point to the Next.js frontend
        \Illuminate\Auth\Notifications\ResetPassword::createUrlUsing(function ($user, string $token) {
            $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000'));
            return "{$frontendUrl}/reset-password?token={$token}&email=" . urlencode($user->email);
        });
    }
}
