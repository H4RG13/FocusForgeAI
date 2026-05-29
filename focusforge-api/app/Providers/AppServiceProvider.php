<?php

namespace App\Providers;

use App\AI\AIClientInterface;
use App\AI\MockAIClient;
use App\Models\AIGeneration;
use App\Models\FocusSession;
use App\Models\Quiz;
use App\Policies\AIGenerationPolicy;
use App\Policies\FocusSessionPolicy;
use App\Policies\QuizPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(AIClientInterface::class, MockAIClient::class);
    }

    public function boot(): void
    {
        Gate::policy(AIGeneration::class, AIGenerationPolicy::class);
        Gate::policy(Quiz::class, QuizPolicy::class);
        Gate::policy(FocusSession::class, FocusSessionPolicy::class);
    }
}
