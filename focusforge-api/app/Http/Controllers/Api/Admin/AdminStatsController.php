<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AIGeneration;
use App\Models\Note;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminStatsController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'users' => [
                'total'      => User::count(),
                'admins'     => User::where('role', 'admin')->count(),
                'new_today'  => User::whereDate('created_at', today())->count(),
                'new_week'   => User::where('created_at', '>=', now()->subWeek())->count(),
            ],
            'tasks' => [
                'total'       => Task::count(),
                'completed'   => Task::where('status', 'done')->count(),
                'in_progress' => Task::where('status', 'in_progress')->count(),
                'overdue'     => Task::where('status', '!=', 'done')
                                     ->where('due_date', '<', today())
                                     ->whereNotNull('due_date')
                                     ->count(),
            ],
            'notes' => [
                'total'       => Note::count(),
                'total_words' => (int) Note::sum('word_count'),
            ],
            'ai' => [
                'total_generations' => AIGeneration::count(),
                'completed'         => AIGeneration::where('status', 'completed')->count(),
                'failed'            => AIGeneration::where('status', 'failed')->count(),
                'summaries'         => AIGeneration::where('type', 'summary')->count(),
                'quizzes'           => AIGeneration::where('type', 'quiz')->count(),
                'total_tokens'      => (int) AIGeneration::sum('prompt_tokens') + (int) AIGeneration::sum('completion_tokens'),
            ],
        ]);
    }
}
