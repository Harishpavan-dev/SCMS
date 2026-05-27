<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\AttendanceSession;
use App\Models\AttendanceRecord;

$user = User::where('name', 'B. Harishpavan')->first();
$studentId = $user->student->id;
$session = AttendanceSession::where('status', 'active')->first();

if ($session) {
    AttendanceRecord::create([
        'attendance_session_id' => $session->id,
        'student_id' => $studentId,
        'marked_at' => now(),
        'marked_by' => 1, // Admin
        'method' => 'manual',
        'status' => 'present'
    ]);
    echo "Created 1 attendance record for $user->name in Session $session->id\n";
} else {
    echo "No active session found to mark attendance.\n";
}
