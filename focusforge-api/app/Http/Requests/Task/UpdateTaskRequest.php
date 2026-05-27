<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'       => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'status'      => ['sometimes', Rule::in(['todo', 'in_progress', 'done', 'archived'])],
            'priority'    => ['sometimes', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'due_date'    => ['sometimes', 'nullable', 'date'],
            'category_id' => ['sometimes', 'nullable', 'integer', 'exists:categories,id'],
        ];
    }
}
