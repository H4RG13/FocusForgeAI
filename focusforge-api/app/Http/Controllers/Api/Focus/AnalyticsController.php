<?php

namespace App\Http\Controllers\Api\Focus;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function __construct(private readonly AnalyticsService $analytics) {}

    public function overview(Request $request): JsonResponse
    {
        return response()->json($this->analytics->overview($request->user()));
    }

    public function focus(Request $request): JsonResponse
    {
        $days = min((int) ($request->query('days', 30)), 90);
        return response()->json($this->analytics->focusByDay($request->user(), $days));
    }

    public function tasks(Request $request): JsonResponse
    {
        $days = min((int) ($request->query('days', 30)), 90);
        return response()->json($this->analytics->taskCompletionByDay($request->user(), $days));
    }

    public function heatmap(Request $request): JsonResponse
    {
        $weeks = min((int) ($request->query('weeks', 52)), 52);
        return response()->json($this->analytics->heatmap($request->user(), $weeks));
    }
}
