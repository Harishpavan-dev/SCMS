<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\Subject;
use App\Models\AttendanceSession;

$user = User::where('name', 'B. Harishpavan')->first();
$student = $user->student;

echo "Student Semester ID: " . $student->current_semester_id . "\n";

$subjectsInSemester = Subject::where('semester_id', $student->current_semester_id)->get();
echo "Subjects in this semester (Count): " . $subjectsInSemester->count() . "\n";
foreach ($subjectsInSemester as $sub) {
    echo " - Subject ID: " . $sub->id . " | " . $sub->name . "\n";
}

echo "\nSessions for this Batch/Semester:\n";
$sessions = AttendanceSession::whereHas('classSession', function($q) use ($student) {
    $q->where('batch_id', $student->batch_id)
      ->where('semester_id', $student->current_semester_id);
})->with('classSession.subject')->get();

foreach ($sessions as $s) {
    echo "Session ID: " . $s->id . " | ClassSession Subject ID: " . $s->classSession->subject_id . " | Subject Semester ID: " . $s->classSession->subject->semester_id . "\n";
}
