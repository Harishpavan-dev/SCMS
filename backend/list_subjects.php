<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Subject;

echo "--- Subjects ---\n";
$subs = Subject::all();
foreach ($subs as $s) {
    echo "ID: " . $s->id . " | Name: " . $s->name . " | Semester ID: " . $s->semester_id . "\n";
}
