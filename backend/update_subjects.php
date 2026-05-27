<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Subject;

$count = Subject::where('semester_id', 1)->update(['semester_id' => 2]);
echo "Updated $count subjects from Semester 1 to Semester 2.\n";
