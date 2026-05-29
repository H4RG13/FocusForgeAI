<?php

namespace App\Services;

use App\Models\FocusSession;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    public function overview(User $user): array
    {
        $totalFocusMinutes = FocusSession::where('user_id', $user->id)
            ->where('completed', true)
            ->sum('duration_minutes');

        $streak = $this->calculateStreak($user);

        return [
            'tasks_completed'     => Task::where('user_id', $user->id)->where('status', 'done')->count(),
            'tasks_total'         => Task::where('user_id', $user->id)->count(),
            'focus_sessions_total'=> FocusSession::where('user_id', $user->id)->count(),
            'focus_minutes_total' => (int) $totalFocusMinutes,
            'focus_hours_total'   => round($totalFocusMinutes / 60, 1),
            'current_streak'      => $streak,
        ];
    }

    public function focusByDay(User $user, int $days = 30): array
    {
        $from = now()->subDays($days - 1)->startOfDay();

        $rows = FocusSession::where('user_id', $user->id)
            ->where('completed', true)
            ->where('started_at', '>=', $from)
            ->select(DB::raw('DATE(started_at) as date'), DB::raw('SUM(duration_minutes) as minutes'), DB::raw('COUNT(*) as sessions'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $result = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $result[] = [
                'date'     => $date,
                'minutes'  => (int) ($rows[$date]->minutes ?? 0),
                'sessions' => (int) ($rows[$date]->sessions ?? 0),
            ];
        }

        return $result;
    }

    public function taskCompletionByDay(User $user, int $days = 30): array
    {
        $from = now()->subDays($days - 1)->startOfDay();

        $rows = Task::where('user_id', $user->id)
            ->where('status', 'done')
            ->whereNotNull('completed_at')
            ->where('completed_at', '>=', $from)
            ->select(DB::raw('DATE(completed_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $result = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $result[] = [
                'date'  => $date,
                'count' => (int) ($rows[$date]->count ?? 0),
            ];
        }

        return $result;
    }

    public function heatmap(User $user, int $weeks = 52): array
    {
        $from = now()->subWeeks($weeks)->startOfDay();

        $focusRows = FocusSession::where('user_id', $user->id)
            ->where('completed', true)
            ->where('started_at', '>=', $from)
            ->select(DB::raw('DATE(started_at) as date'), DB::raw('SUM(duration_minutes) as minutes'))
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        $taskRows = Task::where('user_id', $user->id)
            ->where('status', 'done')
            ->whereNotNull('completed_at')
            ->where('completed_at', '>=', $from)
            ->select(DB::raw('DATE(completed_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        $result = [];
        $days   = $weeks * 7;

        for ($i = $days; $i >= 0; $i--) {
            $date    = now()->subDays($i)->format('Y-m-d');
            $minutes = (int) ($focusRows[$date]->minutes ?? 0);
            $tasks   = (int) ($taskRows[$date]->count ?? 0);
            $level   = 0;
            if ($minutes >= 120 || $tasks >= 5) $level = 4;
            elseif ($minutes >= 60 || $tasks >= 3) $level = 3;
            elseif ($minutes >= 25 || $tasks >= 1) $level = 2;
            elseif ($minutes > 0) $level = 1;

            $result[] = ['date' => $date, 'level' => $level, 'minutes' => $minutes, 'tasks' => $tasks];
        }

        return $result;
    }

    private function calculateStreak(User $user): int
    {
        $dates = FocusSession::where('user_id', $user->id)
            ->where('completed', true)
            ->selectRaw('DATE(started_at) as date')
            ->groupBy('date')
            ->orderByDesc('date')
            ->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->startOfDay())
            ->toArray();

        if (empty($dates)) return 0;

        $streak = 0;
        $check  = Carbon::today();

        // Allow today or yesterday to start the streak
        if (! $dates[0]->eq($check) && ! $dates[0]->eq($check->copy()->subDay())) {
            return 0;
        }

        foreach ($dates as $i => $date) {
            $expected = $check->copy()->subDays($i);
            if ($date->eq($expected)) {
                $streak++;
            } else {
                break;
            }
        }

        return $streak;
    }
}
