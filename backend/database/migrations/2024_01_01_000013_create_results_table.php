<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->foreignId('semester_id')->constrained()->onDelete('cascade');
            $table->decimal('continuous_assessment', 5, 2)->nullable();
            $table->decimal('final_exam', 5, 2)->nullable();
            $table->decimal('total_marks', 5, 2)->nullable();
            $table->string('grade', 5)->nullable();
            $table->decimal('grade_point', 3, 2)->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps();

            $table->unique(['student_id', 'subject_id', 'semester_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('results');
    }
};
