<?php

use App\Http\Controllers\Api\Admin\AdminStatsController;
use App\Http\Controllers\Api\Focus\AnalyticsController;
use App\Http\Controllers\Api\Focus\FocusSessionController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\AIGenerationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public auth routes
    Route::prefix('auth')->group(function () {
        Route::post('/register',        [AuthController::class, 'register']);
        Route::post('/login',           [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password',  [AuthController::class, 'resetPassword']);
    });

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {

        Route::prefix('auth')->group(function () {
            Route::get('/me',              [AuthController::class, 'me']);
            Route::put('/me',              [AuthController::class, 'updateProfile']);
            Route::post('/change-password',[AuthController::class, 'changePassword']);
            Route::post('/logout',         [AuthController::class, 'logout']);
        });

        // Tasks — specific routes before resource to avoid conflicts
        Route::get('tasks/today',             [TaskController::class, 'today']);
        Route::get('tasks/overdue',           [TaskController::class, 'overdue']);
        Route::patch('tasks/{task}/complete', [TaskController::class, 'complete']);
        Route::apiResource('tasks', TaskController::class);

        // Notes
        Route::apiResource('notes', NoteController::class);

        // Categories
        Route::apiResource('categories', CategoryController::class)->except(['show']);

        // AI — rate limited to 20 requests per minute per user
        Route::middleware('throttle:20,1')->group(function () {
            Route::post('notes/{note}/summarize', [AIGenerationController::class, 'summarize']);
            Route::post('notes/{note}/quiz',      [AIGenerationController::class, 'quiz']);
            Route::post('ai/chat',                [AIGenerationController::class, 'chat']);
            Route::post('ai/study-plan',          [AIGenerationController::class, 'studyPlan']);
            Route::get('ai-generations/{aiGeneration}', [AIGenerationController::class, 'show']);
        });

        // Focus sessions
        Route::get('focus-sessions',                          [FocusSessionController::class, 'index']);
        Route::post('focus-sessions',                         [FocusSessionController::class, 'store']);
        Route::patch('focus-sessions/{focusSession}/complete',[FocusSessionController::class, 'complete']);
        Route::patch('focus-sessions/{focusSession}/abandon', [FocusSessionController::class, 'abandon']);
        Route::delete('focus-sessions/{focusSession}',        [FocusSessionController::class, 'destroy']);

        // Analytics
        Route::prefix('analytics')->group(function () {
            Route::get('overview', [AnalyticsController::class, 'overview']);
            Route::get('focus',    [AnalyticsController::class, 'focus']);
            Route::get('tasks',    [AnalyticsController::class, 'tasks']);
            Route::get('heatmap',  [AnalyticsController::class, 'heatmap']);
        });

        // Admin
        Route::middleware('admin')->prefix('admin')->group(function () {
            Route::get('stats',                              [AdminStatsController::class, 'index']);
            Route::get('users',                              [AdminUserController::class, 'index']);
            Route::get('users/{user}',                       [AdminUserController::class, 'show']);
            Route::patch('users/{user}/promote',             [AdminUserController::class, 'promote']);
            Route::patch('users/{user}/demote',              [AdminUserController::class, 'demote']);
            Route::patch('users/{user}/ban',                 [AdminUserController::class, 'ban']);
            Route::patch('users/{user}/unban',               [AdminUserController::class, 'unban']);
            Route::delete('users/{user}',                    [AdminUserController::class, 'destroy']);
        });

        // Quizzes
        Route::get('notes/{note}/quizzes',        [QuizController::class, 'index']);
        Route::get('notes/{note}/quizzes/export', [QuizController::class, 'export']);
        Route::get('quizzes/{quiz}',              [QuizController::class, 'show']);
        Route::post('quizzes/{quiz}/submit',      [QuizController::class, 'submit']);
        Route::delete('quizzes/{quiz}',           [QuizController::class, 'destroy']);
    });
});
