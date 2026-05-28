<?php

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
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login',    [AuthController::class, 'login']);
    });

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {

        Route::prefix('auth')->group(function () {
            Route::get('/me',      [AuthController::class, 'me']);
            Route::put('/me',      [AuthController::class, 'updateProfile']);
            Route::post('/logout', [AuthController::class, 'logout']);
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
            Route::get('ai-generations/{aiGeneration}', [AIGenerationController::class, 'show']);
        });

        // Quizzes
        Route::get('notes/{note}/quizzes',    [QuizController::class, 'index']);
        Route::get('quizzes/{quiz}',          [QuizController::class, 'show']);
        Route::post('quizzes/{quiz}/submit',  [QuizController::class, 'submit']);
    });
});
