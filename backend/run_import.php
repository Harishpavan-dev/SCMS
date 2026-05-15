<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Student;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

$filePath = __DIR__ . '/student_list.txt';
if (!file_exists($filePath)) {
    die("File not found\n");
}

$lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$batchId = 2; // HNDIT 2025 (Junior)
$semesterId = 2; // Year 1 - Semester 2

$count = 0;
foreach ($lines as $line) {
    if (strpos($line, 'Reg No') !== false) continue;
    
    $parts = explode("\t", $line);
    if (count($parts) < 3) continue;
    
    $regNo = trim($parts[0]);
    $name = trim($parts[1]);
    $email = trim($parts[2]);
    
    if (empty($email) || empty($regNo)) continue;

    DB::beginTransaction();
    try {
        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make('password123'),
                'role' => 'student',
                'is_active' => true
            ]
        );

        Student::updateOrCreate(
            ['registration_number' => $regNo],
            [
                'user_id' => $user->id,
                'batch_id' => $batchId,
                'current_semester_id' => $semesterId,
                'status' => 'active',
                'nic_number' => 'P' . str_replace('/', '', $regNo),
                'date_of_birth' => '2000-01-01',
                'gender' => 'other',
                'address' => 'Not Provided'
            ]
        );

        DB::commit();
        echo "Inserted: $name ($regNo)\n";
        $count++;
    } catch (\Exception $e) {
        DB::rollBack();
        echo "Failed: $name - " . $e->getMessage() . "\n";
    }
}

echo "\nTotal Students Processed: $count\n";
