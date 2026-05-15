<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Alter the enum column to include 'pending'
        DB::statement("ALTER TABLE students MODIFY COLUMN status ENUM('pending', 'active', 'graduated', 'suspended', 'dropped') DEFAULT 'active'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE students MODIFY COLUMN status ENUM('active', 'graduated', 'suspended', 'dropped') DEFAULT 'active'");
    }
};
