<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Subject;

echo "--- Subject Semester Distribution ---\n";
$stats = Subject::selectRaw('semester_id, count(*) as count')->groupBy('semester_id')->get();
foreach ($stats as $s) {
    echo "Semester ID " . $s->semester_id . ": " . $s->count . " subjects\n";
}
