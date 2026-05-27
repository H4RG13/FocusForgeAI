<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained()->cascadeOnDelete();
            $table->text('question');
            $table->json('options');
            $table->string('correct_answer');
            $table->text('explanation')->nullable();
            $table->unsignedSmallInteger('order_index')->default(0);
            $table->timestamps();

            $table->index('quiz_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_questions');
    }
};
