<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->longText('content')->nullable();
            $table->string('file_path', 500)->nullable();
            $table->string('file_type', 50)->nullable();
            $table->unsignedInteger('word_count')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['user_id', 'category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};
