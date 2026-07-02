<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\QuizResource;
use App\Models\Note;
use App\Models\Quiz;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use PhpOffice\PhpWord\PhpWord;
use Symfony\Component\HttpFoundation\StreamedResponse;

class QuizController extends Controller
{
    public function index(Request $request, Note $note): JsonResponse
    {
        $this->authorize('view', $note);

        $quizzes = $note->quizzes()
            ->with('questions')
            ->latest()
            ->get();

        return response()->json(QuizResource::collection($quizzes));
    }

    public function show(Quiz $quiz): JsonResponse
    {
        $this->authorize('view', $quiz);

        return response()->json(new QuizResource($quiz->load('questions')));
    }

    public function destroy(Quiz $quiz): JsonResponse
    {
        $this->authorize('delete', $quiz);
        $quiz->delete();
        return response()->json(null, 204);
    }

    public function export(Request $request, Note $note): StreamedResponse
    {
        $this->authorize('view', $note);

        $data = $request->validate([
            'quiz_ids'   => 'required|array|min:1',
            'quiz_ids.*' => 'integer',
        ]);

        $quizzesById = Quiz::with('questions')
            ->whereIn('id', $data['quiz_ids'])
            ->where('note_id', $note->id)
            ->get()
            ->keyBy('id');

        $ordered = collect($data['quiz_ids'])
            ->map(fn($id) => $quizzesById->get($id))
            ->filter()
            ->values();

        $typeLabels = [
            'multiple_choice' => 'Multiple Choice',
            'true_false'      => 'True / False',
            'identification'  => 'Identification',
            'enumeration'     => 'Enumeration',
        ];

        $phpWord = new PhpWord();
        $phpWord->getSettings()->setUpdateFields(true);

        $section = $phpWord->addSection([
            'marginLeft'   => 1080,
            'marginRight'  => 1080,
            'marginTop'    => 1080,
            'marginBottom' => 1080,
        ]);

        // Document header
        $section->addText(
            $note->title,
            ['bold' => true, 'size' => 20, 'color' => '1a1a2e'],
            ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER],
        );
        $section->addText(
            'Quiz Collection',
            ['size' => 12, 'italic' => true, 'color' => '6b7280'],
            ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER],
        );
        $section->addText(
            now()->format('F j, Y'),
            ['size' => 10, 'color' => '9ca3af'],
            ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER],
        );
        $section->addTextBreak(2);

        // Questions
        foreach ($ordered as $quizIndex => $quiz) {
            if ($quizIndex > 0) {
                $section->addTextBreak(1);
            }

            $section->addText(
                ($quizIndex + 1) . '. ' . $quiz->title,
                ['bold' => true, 'size' => 14, 'color' => '4f46e5'],
            );
            $section->addText(
                ($typeLabels[$quiz->quiz_type] ?? 'Multiple Choice') . ' · ' . $quiz->questions->count() . ' items',
                ['size' => 10, 'italic' => true, 'color' => '6b7280'],
            );
            $section->addTextBreak(1);

            $isMC   = $quiz->quiz_type === 'multiple_choice';
            $isTF   = $quiz->quiz_type === 'true_false';

            foreach ($quiz->questions->sortBy('order_index') as $qIdx => $question) {
                $section->addText(
                    ($qIdx + 1) . '. ' . $question->question,
                    ['size' => 11, 'bold' => true],
                );

                if ($isMC) {
                    foreach ($question->options as $optIdx => $option) {
                        $section->addText(
                            '    ' . chr(65 + $optIdx) . '.  ' . $option,
                            ['size' => 10, 'color' => '374151'],
                        );
                    }
                } elseif ($isTF) {
                    $section->addText('    A.  True',  ['size' => 10, 'color' => '374151']);
                    $section->addText('    B.  False', ['size' => 10, 'color' => '374151']);
                } else {
                    $section->addText(
                        '    Answer: ___________________________________',
                        ['size' => 10, 'color' => '9ca3af'],
                    );
                }

                $section->addTextBreak(1);
            }
        }

        // Answer key
        $section->addPageBreak();
        $section->addText(
            'ANSWER KEY',
            ['bold' => true, 'size' => 16, 'color' => '1a1a2e'],
            ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER],
        );
        $section->addTextBreak(2);

        foreach ($ordered as $quizIndex => $quiz) {
            $section->addText(
                ($quizIndex + 1) . '. ' . $quiz->title,
                ['bold' => true, 'size' => 12, 'color' => '4f46e5'],
            );

            foreach ($quiz->questions->sortBy('order_index') as $qIdx => $question) {
                $answer    = $question->correct_answer;
                $isLetter  = in_array($quiz->quiz_type, ['multiple_choice', 'true_false']);

                if ($isLetter && !empty($question->options)) {
                    $idx        = ord(strtoupper($answer)) - 65;
                    $optionText = $question->options[$idx] ?? $answer;
                    $display    = "{$answer}. {$optionText}";
                } else {
                    $display = $answer;
                }

                $section->addText("    " . ($qIdx + 1) . ". {$display}", ['size' => 10]);

                if ($question->explanation) {
                    $section->addText(
                        "       ↳ {$question->explanation}",
                        ['size' => 9, 'italic' => true, 'color' => '6b7280'],
                    );
                }
            }

            $section->addTextBreak(1);
        }

        $filename = Str::slug($note->title) . '-quizzes.docx';

        return response()->streamDownload(function () use ($phpWord) {
            $phpWord->save('php://output', 'Word2007');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ]);
    }

    private function checkTextAnswer(string $given, string $correct): bool
    {
        $given   = strtolower(trim($given));
        $correct = strtolower(trim($correct));

        if ($given === $correct) return true;

        $stopWords = [
            'the','a','an','is','are','was','were','be','been',
            'of','in','on','at','to','for','with','by','from',
            'and','or','but','not','that','this','it','its',
            'as','has','have','had',
        ];

        $keywords = array_values(array_filter(
            preg_split('/\s+/', preg_replace('/[^a-z0-9\s]/', '', $correct)),
            fn($w) => strlen($w) > 2 && !in_array($w, $stopWords)
        ));

        if (empty($keywords)) return false;

        foreach ($keywords as $kw) {
            if (!preg_match('/\b' . preg_quote($kw, '/') . '\b/', $given)) {
                return false;
            }
        }

        return true;
    }

    public function submit(Request $request, Quiz $quiz): JsonResponse
    {
        $this->authorize('view', $quiz);

        $data = $request->validate([
            'answers'   => 'required|array',
            'answers.*' => 'required|string',
        ]);

        $questions = $quiz->questions;
        $correct   = 0;
        $results   = [];

        $textBased = in_array($quiz->quiz_type, ['identification', 'enumeration']);

        foreach ($questions as $question) {
            $given   = $data['answers'][$question->id] ?? null;
            $isRight = $textBased
                ? $this->checkTextAnswer((string) $given, $question->correct_answer)
                : $given === $question->correct_answer;

            if ($isRight) {
                $correct++;
            }

            $results[] = [
                'question_id'    => $question->id,
                'question'       => $question->question,
                'given_answer'   => $given,
                'correct_answer' => $question->correct_answer,
                'is_correct'     => $isRight,
                'explanation'    => $question->explanation,
            ];
        }

        $score = $questions->count() > 0
            ? round(($correct / $questions->count()) * 100, 1)
            : 0;

        $quiz->increment('attempts_count');
        $quiz->update(['score' => $score, 'status' => 'completed']);

        return response()->json([
            'score'           => $score,
            'correct'         => $correct,
            'total'           => $questions->count(),
            'results'         => $results,
        ]);
    }
}
