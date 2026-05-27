<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\Student;
use App\Models\AttendanceSession;

$user = User::where('name', 'B. Harishpavan')->first();
if ($user) {
    $student = $user->student;
    echo "--- Student Details ---\n";
    echo "Name: " . $user->name . "\n";
    echo "Batch ID: " . $student->batch_id . " (" . ($student->batch->name ?? 'N/A') . ")\n";
    echo "Semester ID: " . $student->current_semester_id . " (" . ($student->currentSemester->number ?? 'N/A') . ")\n";
    
    echo "\n--- Related Sessions ---\n";
    $sessions = AttendanceSession::whereHas('classSession', function($q) use ($student) {
        $q->where('batch_id', $student->batch_id)
          ->where('semester_id', $student->current_semester_id);
    })->with('classSession.subject')->get();
    
    echo "Count: " . $sessions->count() . "\n";
    foreach ($sessions as $s) {
        echo "Session ID: " . $s->id . " | Subject: " . $s->classSession->subject->name . "\n";
    }
} else {
    echo "User not found\n";
}
