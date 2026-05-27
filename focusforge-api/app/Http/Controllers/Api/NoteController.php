<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Note\StoreNoteRequest;
use App\Http\Requests\Note\UpdateNoteRequest;
use App\Http\Resources\NoteCollection;
use App\Http\Resources\NoteResource;
use App\Models\Note;
use App\Services\NoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class NoteController extends Controller
{
    public function __construct(private readonly NoteService $noteService) {}

    public function index(Request $request): JsonResponse
    {
        $notes = $this->noteService->listForUser(
            user: $request->user(),
            filters: $request->only(['category_id', 'search']),
            perPage: $request->integer('per_page', 15),
        );

        return response()->json(new NoteCollection($notes));
    }

    public function store(StoreNoteRequest $request): JsonResponse
    {
        $note = $this->noteService->create($request->user(), $request->validated());
        return response()->json(['data' => new NoteResource($note)], 201);
    }

    public function show(Request $request, Note $note): JsonResponse
    {
        $this->authorize('view', $note);
        return response()->json(['data' => new NoteResource($note->load('category'))]);
    }

    public function update(UpdateNoteRequest $request, Note $note): JsonResponse
    {
        $this->authorize('update', $note);
        $note = $this->noteService->update($note, $request->validated());
        return response()->json(['data' => new NoteResource($note)]);
    }

    public function destroy(Request $request, Note $note): Response
    {
        $this->authorize('delete', $note);
        $this->noteService->delete($note);
        return response()->noContent();
    }
}
