<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('file_uploads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('subject_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('semester_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('type', ['note', 'material', 'assignment', 'other'])->default('material');
            $table->string('title', 255);
            $table->string('original_name', 255);
            $table->string('file_path', 500);
            $table->bigInteger('file_size')->default(0);
            $table->string('mime_type', 100)->nullable();
            $table->timestamps();

            $table->index(['subject_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('file_uploads');
    }
};
