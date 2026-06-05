<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->handleRequest(\Illuminate\Http\Request::capture());

use Illuminate\Support\Facades\DB;

echo "=== LECTURER-SUBJECT PIVOT ===" . PHP_EOL;
$pivots = DB::table('lecturer_subject')->get();
foreach ($pivots as $p) {
    echo "lecturer_id={$p->lecturer_id} subject_id={$p->subject_id}" . PHP_EOL;
}

echo PHP_EOL . "=== LECTURERS ===" . PHP_EOL;
$lecturers = \App\Models\Lecturer::with('user')->get();
foreach ($lecturers as $l) {
    echo "ID={$l->id} Name={$l->user->name} Email={$l->user->email}" . PHP_EOL;
}

echo PHP_EOL . "=== SUBJECTS ===" . PHP_EOL;
$subjects = \App\Models\Subject::with('semester')->get();
foreach ($subjects as $s) {
    echo "ID={$s->id} Code={$s->code} Name={$s->name} SemID={$s->semester_id}" . PHP_EOL;
}

echo PHP_EOL . "=== STUDENTS (first 5) ===" . PHP_EOL;
$students = \App\Models\Student::with('user')->take(5)->get();
foreach ($students as $st) {
    echo "ID={$st->id} Name={$st->user->name} Email={$st->user->email} SemID={$st->current_semester_id} Role={$st->user->role}" . PHP_EOL;
}
