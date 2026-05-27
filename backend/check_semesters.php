<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Semester;

echo "--- Semesters ---\n";
$sems = Semester::all();
foreach ($sems as $s) {
    echo "ID: " . $s->id . " | Num: " . $s->number . "\n";
}
