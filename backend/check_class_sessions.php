<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\ClassSession;

echo "--- Class Sessions ---\n";
$sessions = ClassSession::all();
foreach ($sessions as $s) {
    echo "ID: " . $s->id . " | Batch ID: " . $s->batch_id . " | Semester ID: " . $s->semester_id . " | Subject ID: " . $s->subject_id . "\n";
}
