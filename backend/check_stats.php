<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\AttendanceSession;
use App\Models\AttendanceRecord;
use App\Models\Student;
use App\Models\Batch;

echo "--- Attendance Stats ---\n";
echo "Total Sessions: " . AttendanceSession::count() . "\n";
echo "Total Records: " . AttendanceRecord::count() . "\n";
echo "Total Students: " . Student::count() . "\n";

$student = Student::with('user', 'batch', 'currentSemester')->first();
if ($student) {
    echo "\n--- First Student Sample ---\n";
    echo "Name: " . $student->user->name . "\n";
    echo "Batch: " . ($student->batch->name ?? 'N/A') . " (ID: " . $student->batch_id . ")\n";
    echo "Semester: " . ($student->currentSemester->number ?? 'N/A') . " (ID: " . $student->current_semester_id . ")\n";
}

$session = AttendanceSession::with('classSession')->first();
if ($session) {
    echo "\n--- First Session Sample ---\n";
    echo "Batch ID: " . $session->classSession->batch_id . "\n";
    echo "Semester ID: " . $session->classSession->semester_id . "\n";
    echo "Subject ID: " . $session->classSession->subject_id . "\n";
}
