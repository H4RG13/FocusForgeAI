<?php

namespace App\Services;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class CategoryService
{
    public function listForUser(User $user): Collection
    {
        return Category::where('user_id', $user->id)->orderBy('name')->get();
    }

    public function create(User $user, array $data): Category
    {
        return Category::create([...$data, 'user_id' => $user->id]);
    }

    public function update(Category $category, array $data): Category
    {
        $category->update($data);
        return $category->fresh();
    }

    public function delete(Category $category): void
    {
        $category->delete();
    }
}
