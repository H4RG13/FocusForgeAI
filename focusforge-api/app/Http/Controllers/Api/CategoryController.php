<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CategoryController extends Controller
{
    public function __construct(private readonly CategoryService $categoryService) {}

    public function index(Request $request): JsonResponse
    {
        $categories = $this->categoryService->listForUser($request->user());
        return response()->json(['data' => CategoryResource::collection($categories)]);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->categoryService->create($request->user(), $request->validated());
        return response()->json(['data' => new CategoryResource($category)], 201);
    }

    public function update(StoreCategoryRequest $request, Category $category): JsonResponse
    {
        $this->authorize('update', $category);
        $category = $this->categoryService->update($category, $request->validated());
        return response()->json(['data' => new CategoryResource($category)]);
    }

    public function destroy(Request $request, Category $category): Response
    {
        $this->authorize('delete', $category);
        $this->categoryService->delete($category);
        return response()->noContent();
    }
}
