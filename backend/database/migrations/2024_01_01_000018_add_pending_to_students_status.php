<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Alter the enum column to include 'pending'
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE students MODIFY COLUMN status ENUM('pending', 'active', 'graduated', 'suspended', 'dropped') DEFAULT 'active'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE students MODIFY COLUMN status ENUM('active', 'graduated', 'suspended', 'dropped') DEFAULT 'active'");
        }
    }
};
