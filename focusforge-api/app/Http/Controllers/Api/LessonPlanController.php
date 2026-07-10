<?php

namespace App\Http\Controllers\Api;

use App\AI\AIClientInterface;
use App\Http\Controllers\Controller;
use App\Http\Resources\LessonPlanResource;
use App\Models\LessonPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;
use Symfony\Component\HttpFoundation\StreamedResponse;
use ZipArchive;

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

    // GET /lesson-plans/{lessonPlan}/export/json
    public function exportJson(LessonPlan $lessonPlan): Response
    {
        $this->authorize('view', $lessonPlan);
        $lessonPlan->load('sections');

        $data = [
            'title'            => $lessonPlan->title,
            'subject'          => $lessonPlan->subject,
            'grade_level'      => $lessonPlan->grade_level,
            'description'      => $lessonPlan->description,
            'duration_minutes' => $lessonPlan->duration_minutes,
            'sections'         => $lessonPlan->sections
                ->sortBy('sort_order')
                ->values()
                ->map(fn($s) => [
                    'type'       => $s->type,
                    'content'    => $s->content,
                    'sort_order' => $s->sort_order,
                ])->toArray(),
        ];

        $filename = Str::slug($lessonPlan->title) . '-lesson-plan.json';

        return response(
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
            200,
            [
                'Content-Type'        => 'application/json',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
                'Cache-Control'       => 'no-cache, no-store',
            ]
        );
    }

    // GET /lesson-plans/{lessonPlan}/export/docx
    public function exportDocx(LessonPlan $lessonPlan): StreamedResponse
    {
        $this->authorize('view', $lessonPlan);
        $lessonPlan->load('sections', 'user');

        $phpWord = new PhpWord();
        $phpWord->setDefaultFontName('Calibri');
        $phpWord->setDefaultFontSize(11);
        $phpWord->addTitleStyle(1, ['name' => 'Calibri', 'size' => 20, 'bold' => true, 'color' => '1F2937']);
        $phpWord->addTitleStyle(2, ['name' => 'Calibri', 'size' => 14, 'bold' => true, 'color' => '374151']);
        $phpWord->addTitleStyle(3, ['name' => 'Calibri', 'size' => 11, 'bold' => true, 'color' => '4F46E5']);

        $sec     = $phpWord->addSection();
        $metaFmt = ['name' => 'Calibri', 'size' => 10, 'color' => '6B7280'];

        $sec->addTitle($lessonPlan->title, 1);
        $sec->addTextRun()->addText(
            "{$lessonPlan->subject}  |  {$lessonPlan->grade_level}  |  {$lessonPlan->duration_minutes} minutes",
            $metaFmt
        );
        if ($lessonPlan->user) {
            $sec->addTextRun()->addText("By: {$lessonPlan->user->name}", $metaFmt);
        }
        $sec->addTextBreak(1);

        if ($lessonPlan->description) {
            $sec->addTitle('Overview', 2);
            $sec->addText($lessonPlan->description);
            $sec->addTextBreak(1);
        }

        $sectionLabels = [
            'introduction' => 'Introduction',
            'activity'     => 'Activity',
            'discussion'   => 'Discussion',
            'assessment'   => 'Assessment',
            'wrap_up'      => 'Wrap Up',
        ];

        if ($lessonPlan->sections->isNotEmpty()) {
            $sec->addTitle('Lesson Sections', 2);
            $sec->addTextBreak(1);
            foreach ($lessonPlan->sections->sortBy('sort_order')->values() as $i => $s) {
                $label = ($i + 1) . '. ' . ($sectionLabels[$s->type] ?? $s->type);
                $sec->addTitle($label, 3);
                $sec->addText($s->content);
                $sec->addTextBreak(1);
            }
        }

        $filename = Str::slug($lessonPlan->title) . '-lesson-plan.docx';

        return response()->stream(function () use ($phpWord) {
            IOFactory::createWriter($phpWord, 'Word2007')->save('php://output');
        }, 200, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control'       => 'no-cache, no-store',
        ]);
    }

    // POST /lesson-plans/import
    public function importFile(Request $request): JsonResponse
    {
        $this->authorize('create', LessonPlan::class);

        $request->validate(['file' => ['required', 'file', 'max:5120']]);

        $file      = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());

        if (!in_array($extension, ['json', 'docx', 'txt'])) {
            return response()->json(['message' => 'Only .json, .docx, and .txt files are supported.'], 422);
        }

        // JSON — parse directly, no AI needed
        if ($extension === 'json') {
            $content = json_decode(file_get_contents($file->getRealPath()), true);
            if (!$content || !isset($content['title'])) {
                return response()->json(['message' => 'Invalid lesson plan JSON file.'], 422);
            }
            return response()->json(['data' => $this->sanitizeImportData($content)]);
        }

        // Extract text
        $text = '';
        if ($extension === 'docx') {
            $zip = new ZipArchive();
            if ($zip->open($file->getRealPath()) === true) {
                $xml  = $zip->getFromName('word/document.xml');
                $zip->close();
                $text = trim(preg_replace('/\s+/', ' ', strip_tags($xml)));
            }
        } else {
            $text = trim((string) file_get_contents($file->getRealPath()));
        }

        if (empty($text)) {
            return response()->json(['message' => 'Could not extract text from the file.'], 422);
        }

        $ai     = app(AIClientInterface::class);
        $parsed = $ai->parseLessonPlan($text);

        return response()->json(['data' => $this->sanitizeImportData($parsed)]);
    }

    private function sanitizeImportData(array $data): array
    {
        $valid    = ['introduction', 'activity', 'discussion', 'assessment', 'wrap_up'];
        $sections = [];

        foreach ($data['sections'] ?? [] as $i => $s) {
            $sections[] = [
                'type'       => in_array($s['type'] ?? '', $valid) ? $s['type'] : 'introduction',
                'content'    => (string) ($s['content'] ?? ''),
                'sort_order' => (int)    ($s['sort_order'] ?? $i),
            ];
        }

        return [
            'title'            => (string) ($data['title']            ?? ''),
            'subject'          => (string) ($data['subject']          ?? ''),
            'grade_level'      => (string) ($data['grade_level']      ?? ''),
            'description'      => (string) ($data['description']      ?? ''),
            'duration_minutes' => (int)    ($data['duration_minutes'] ?? 60),
            'sections'         => $sections,
        ];
    }
}
