<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attendance_session_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->timestamp('marked_at');
            $table->foreignId('marked_by')->constrained('users')->onDelete('cascade');
            $table->enum('method', ['qr', 'manual', 'rep'])->default('qr');
            $table->enum('status', ['present', 'absent', 'late', 'unmarked'])->default('present');
            $table->timestamps();

            $table->unique(['attendance_session_id', 'student_id']);
            $table->index('student_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_records');
    }
};
