<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->foreignId('lecturer_id')->constrained()->onDelete('cascade');
            $table->foreignId('semester_id')->constrained()->onDelete('cascade');
            $table->foreignId('batch_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->integer('period')->nullable(); // 1, 2, 3, etc.
            $table->time('start_time');
            $table->time('end_time');
            $table->string('room', 50)->nullable();
            $table->enum('status', ['scheduled', 'ongoing', 'completed', 'cancelled'])->default('scheduled');
            $table->timestamps();

            $table->index(['date', 'lecturer_id']);
            $table->index(['date', 'batch_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_sessions');
    }
};
