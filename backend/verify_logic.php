<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\Subject;
use App\Models\AttendanceSession;
use App\Models\AttendanceRecord;

$user = User::where('name', 'B. Harishpavan')->with('student.batch', 'student.currentSemester')->first();
$student = $user->student;

echo "--- Debugging getStudentAttendance logic ---\n";
echo "Student: $user->name | Semester: " . $student->current_semester_id . "\n";

$subjects = Subject::where('semester_id', $student->current_semester_id)->get();
echo "Subjects Found for this Semester: " . $subjects->count() . "\n";

$summary = [];
$totalPresent = 0;
$totalSessionsCounted = 0;

foreach ($subjects as $subject) {
    $totalSubSessions = AttendanceSession::whereHas('classSession', function($q) use ($student, $subject) {
        $q->where('batch_id', $student->batch_id)
          ->where('semester_id', $student->current_semester_id)
          ->where('subject_id', $subject->id);
    })->count();

    if ($totalSubSessions === 0) continue;

    $subPresentCount = AttendanceRecord::where('student_id', $student->id)
        ->where('status', 'present')
        ->whereHas('attendanceSession.classSession', fn($q) => $q->where('subject_id', $subject->id))
        ->count();

    $summary[] = [
        'name' => $subject->name,
        'present' => $subPresentCount,
        'total' => $totalSubSessions
    ];
    
    $totalPresent += $subPresentCount;
    $totalSessionsCounted += $totalSubSessions;
}

echo "Summary Items: " . count($summary) . "\n";
foreach($summary as $s) {
    echo " - " . $s['name'] . ": " . $s['present'] . "/" . $s['total'] . "\n";
}
echo "Overall: " . ($totalSessionsCounted > 0 ? ($totalPresent / $totalSessionsCounted * 100) : 0) . "%\n";
