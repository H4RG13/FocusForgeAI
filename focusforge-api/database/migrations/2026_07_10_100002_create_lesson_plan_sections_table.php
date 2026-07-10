<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lesson_plan_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_plan_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['introduction', 'activity', 'discussion', 'assessment', 'wrap_up']);
            $table->text('content');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_plan_sections');
    }
};
