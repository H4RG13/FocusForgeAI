<?php

namespace App\Http\Requests\Note;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'       => ['sometimes', 'string', 'max:255'],
            'content'     => ['sometimes', 'nullable', 'string'],
            'category_id' => ['sometimes', 'nullable', 'integer', 'exists:categories,id'],
        ];
    }
}
