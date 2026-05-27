<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_generations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->morphs('generatable');
            $table->enum('type', ['summary', 'quiz', 'study_plan', 'chat']);
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->unsignedInteger('prompt_tokens')->default(0);
            $table->unsignedInteger('completion_tokens')->default(0);
            $table->string('model', 50)->default('gpt-4o');
            $table->string('input_hash', 64)->nullable();
            $table->json('result')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index('input_hash');
            $table->index(['user_id', 'type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_generations');
    }
};
