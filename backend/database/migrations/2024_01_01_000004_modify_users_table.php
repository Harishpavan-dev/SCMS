<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'lecturer', 'student', 'rep', 'hod'])->default('student')->after('email');
            $table->string('avatar', 500)->nullable()->after('role');
            $table->boolean('is_active')->default(true)->after('avatar');
            $table->string('phone', 20)->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'avatar', 'is_active', 'phone']);
        });
    }
};
