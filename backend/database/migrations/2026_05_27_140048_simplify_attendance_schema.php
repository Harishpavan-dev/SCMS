<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add class_session_id to attendance_records
        Schema::table('attendance_records', function (Blueprint $table) {
            $table->foreignId('class_session_id')->after('id')->nullable()->constrained()->onDelete('cascade');
        });

        // 2. Migrate existing data
        if (Schema::hasTable('attendance_sessions')) {
            DB::statement('UPDATE attendance_records ar 
                           JOIN attendance_sessions ads ON ar.attendance_session_id = ads.id 
                           SET ar.class_session_id = ads.class_session_id');
        }

        // 3. Clean up attendance_records
        Schema::table('attendance_records', function (Blueprint $table) {
            // Drop foreign key first
            $table->dropForeign(['attendance_session_id']);
            $table->dropColumn('attendance_session_id');
            
            // Make class_session_id required now that data is migrated
            // Note: In SQLite (common for tests) change() is tricky, but for MySQL it works.
            $table->unsignedBigInteger('class_session_id')->nullable(false)->change();
        });

        // 4. Delete the AttendanceSessions table entirely
        Schema::dropIfExists('attendance_sessions');
    }

    public function down(): void
    {
        // Not easily reversible without session table, but let's leave it empty or basic
    }
};
