<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LessonPlanResource;
use App\Models\LessonPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LessonPlanController extends Controller
{
    // GET /lesson-plans — teacher sees own; student sees published only
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = LessonPlan::with('user')
            ->when($request->subject,     fn($q, $v) => $q->where('subject', $v))
            ->when($request->grade_level, fn($q, $v) => $q->where('grade_level', $v))
            ->when($request->search,      fn($q, $v) => $q->where('title', 'like', "%{$v}%"));

        if ($user->isTeacher()) {
            // Teachers see their own plans (published + drafts)
            $query->where('user_id', $user->id);
        } elseif ($user->isStudent()) {
            // Students only see published plans from any teacher
            $query->where('is_published', true)->with('user');
        } else {
            // Admin sees all
        }

        $plans = $query->latest()->paginate(20);

        return response()->json(LessonPlanResource::collection($plans)->response()->getData());
    }

    // GET /lesson-plans/{lessonPlan}
    public function show(Request $request, LessonPlan $lessonPlan): JsonResponse
    {
        $this->authorize('view', $lessonPlan);

        $lessonPlan->load('sections', 'user');

        return response()->json(['data' => new LessonPlanResource($lessonPlan)]);
    }

    // POST /lesson-plans
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', LessonPlan::class);

        $data = $request->validate([
            'title'            => ['required', 'string', 'max:255'],
            'subject'          => ['required', 'string', 'max:100'],
            'grade_level'      => ['required', 'string', 'max:50'],
            'description'      => ['nullable', 'string', 'max:2000'],
            'duration_minutes' => ['integer', 'min:5', 'max:480'],
            'sections'         => ['nullable', 'array'],
            'sections.*.type'       => ['required', 'in:introduction,activity,discussion,assessment,wrap_up'],
            'sections.*.content'    => ['required', 'string'],
            'sections.*.sort_order' => ['integer', 'min:0'],
        ]);

        $lessonPlan = LessonPlan::create([
            'user_id'          => $request->user()->id,
            'title'            => $data['title'],
            'subject'          => $data['subject'],
            'grade_level'      => $data['grade_level'],
            'description'      => $data['description'] ?? null,
            'duration_minutes' => $data['duration_minutes'] ?? 60,
        ]);

        if (!empty($data['sections'])) {
            foreach ($data['sections'] as $section) {
                $lessonPlan->sections()->create($section);
            }
        }

        $lessonPlan->load('sections', 'user');

        return response()->json(['data' => new LessonPlanResource($lessonPlan)], 201);
    }

    // PUT /lesson-plans/{lessonPlan}
    public function update(Request $request, LessonPlan $lessonPlan): JsonResponse
    {
        $this->authorize('update', $lessonPlan);

        $data = $request->validate([
            'title'            => ['sometimes', 'string', 'max:255'],
            'subject'          => ['sometimes', 'string', 'max:100'],
            'grade_level'      => ['sometimes', 'string', 'max:50'],
            'description'      => ['nullable', 'string', 'max:2000'],
            'duration_minutes' => ['sometimes', 'integer', 'min:5', 'max:480'],
            'sections'         => ['nullable', 'array'],
            'sections.*.type'       => ['required', 'in:introduction,activity,discussion,assessment,wrap_up'],
            'sections.*.content'    => ['required', 'string'],
            'sections.*.sort_order' => ['integer', 'min:0'],
        ]);

        $lessonPlan->update(collect($data)->except('sections')->toArray());

        // Replace sections if provided
        if (array_key_exists('sections', $data)) {
            $lessonPlan->sections()->delete();
            foreach ($data['sections'] ?? [] as $section) {
                $lessonPlan->sections()->create($section);
            }
        }

        $lessonPlan->load('sections', 'user');

        return response()->json(['data' => new LessonPlanResource($lessonPlan)]);
    }

    // DELETE /lesson-plans/{lessonPlan}
    public function destroy(LessonPlan $lessonPlan): JsonResponse
    {
        $this->authorize('delete', $lessonPlan);

        $lessonPlan->delete();

        return response()->json(['message' => 'Lesson plan deleted.']);
    }

    // PATCH /lesson-plans/{lessonPlan}/publish
    public function publish(LessonPlan $lessonPlan): JsonResponse
    {
        $this->authorize('publish', $lessonPlan);

        $lessonPlan->update(['is_published' => true]);

        return response()->json(['message' => 'Lesson plan published.', 'data' => new LessonPlanResource($lessonPlan)]);
    }

    // PATCH /lesson-plans/{lessonPlan}/unpublish
    public function unpublish(LessonPlan $lessonPlan): JsonResponse
    {
        $this->authorize('publish', $lessonPlan);

        $lessonPlan->update(['is_published' => false]);

        return response()->json(['message' => 'Lesson plan unpublished.', 'data' => new LessonPlanResource($lessonPlan)]);
    }
}
