<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('registration_number', 50)->unique();
            $table->string('nic_number', 20)->unique();
            $table->date('date_of_birth');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->text('address')->nullable();
            $table->foreignId('batch_id')->constrained()->onDelete('restrict');
            $table->foreignId('current_semester_id')->nullable()->constrained('semesters')->onDelete('set null');
            $table->string('qr_code_data', 255)->unique()->nullable();
            $table->string('id_card_pdf_path', 500)->nullable();
            $table->enum('status', ['pending', 'active', 'graduated', 'suspended', 'dropped'])->default('active');
            $table->timestamps();

            $table->index('batch_id');
            $table->index('current_semester_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
