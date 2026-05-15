<?php

namespace Database\Seeders;

use App\Models\{User, Batch, Semester, Subject, Lecturer, Student};
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Admins
        User::create([
            'name' => 'System Admin',
            'email' => 'admin@atijaffna.lk',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Department Head',
            'email' => 'hod@atijaffna.lk',
            'password' => Hash::make('password'),
            'role' => 'hod',
            'is_active' => true,
        ]);

        // 2. Define standard HNDIT Semesters (1-4)
        $semesters = [];
        $semesterNames = [
            1 => 'Year 1 - Semester 1',
            2 => 'Year 1 - Semester 2',
            3 => 'Year 2 - Semester 1',
            4 => 'Year 2 - Semester 2',
        ];

        for ($i = 1; $i <= 4; $i++) {
            $semesters[] = Semester::create([
                'name' => $semesterNames[$i],
                'number' => $i,
                'start_date' => now()->addMonths(($i-1)*6),
                'end_date' => now()->addMonths($i*6)->subDays(1),
            ]);
        }

        // 3. Create active Batches
        $seniorBatch = Batch::create(['name' => 'HNDIT 2024 (Senior)', 'year' => 2024]);
        $juniorBatch = Batch::create(['name' => 'HNDIT 2025 (Junior)', 'year' => 2025]);

        // 4. Create Subjects across all 4 Semesters
        $subjectsData = [
            // Year 1 - Semester 1
            ['code' => 'IT1101', 'name' => 'IT Concepts', 'credits' => 3, 'sem' => 1],
            ['code' => 'IT1102', 'name' => 'Programming Concepts', 'credits' => 4, 'sem' => 1],
            
            // Year 1 - Semester 2
            ['code' => 'IT1203', 'name' => 'Data Structures', 'credits' => 3, 'sem' => 2],
            ['code' => 'IT1204', 'name' => 'Statistics for IT', 'credits' => 2, 'sem' => 2],
            
            // Year 2 - Semester 1 (Numeric Sem 3)
            ['code' => 'IT2105', 'name' => 'Rapid Application Development', 'credits' => 4, 'sem' => 3],
            ['code' => 'IT2106', 'name' => 'Professional Issues in IT', 'credits' => 2, 'sem' => 3],
            
            // Year 2 - Semester 2 (Numeric Sem 4)
            ['code' => 'IT2207', 'name' => 'Internet Management', 'credits' => 3, 'sem' => 4],
            ['code' => 'IT2208', 'name' => 'Advanced Java', 'credits' => 4, 'sem' => 4],
        ];

        foreach ($subjectsData as $s) {
            Subject::create([
                'code' => $s['code'], 
                'name' => $s['name'], 
                'credit_hours' => $s['credits'],
                'semester_id' => $semesters[$s['sem'] - 1]->id
            ]);
        }

        // 5. Create Lecturers
        $lecturers = [
            ['name' => 'Dr. A. Perera', 'email' => 'perera@atijaffna.lk', 'emp' => 'LEC001'],
            ['name' => 'Mr. B. Silva', 'email' => 'silva@atijaffna.lk', 'emp' => 'LEC002'],
        ];

        foreach ($lecturers as $ld) {
            $user = User::create([
                'name' => $ld['name'],
                'email' => $ld['email'],
                'password' => Hash::make('password'),
                'role' => 'lecturer',
            ]);
            Lecturer::create([
                'user_id' => $user->id,
                'employee_id' => $ld['emp'],
                'department' => 'IT',
            ]);
        }

        // 6. Create Students (Senior Batch - Year 2 - Semester 1 [Numeric S3])
        for ($i = 1; $i <= 10; $i++) {
            $isRep = ($i <= 2);
            $user = User::create([
                'name' => "Senior Student " . str_pad($i, 2, '0', STR_PAD_LEFT),
                'email' => "senior{$i}@atijaffna.lk",
                'password' => Hash::make('password'),
                'role' => $isRep ? 'rep' : 'student',
            ]);
            $reg = "ATI/HNDIT/2024/" . str_pad($i, 3, '0', STR_PAD_LEFT);
            Student::create([
                'user_id' => $user->id,
                'registration_number' => $reg,
                'nic_number' => "2002" . str_pad($i, 5, '0', STR_PAD_LEFT) . "V",
                'date_of_birth' => "2002-01-01",
                'gender' => $i % 2 == 0 ? 'female' : 'male',
                'batch_id' => $seniorBatch->id,
                'current_semester_id' => $semesters[2]->id, // Year 2 - Sem 1 (S3)
                'qr_code_data' => json_encode(['reg' => $reg, 'id' => $user->id, 'type' => 'student']),
                'status' => 'active',
            ]);
        }

        // 7. Create Students (Junior Batch - Year 1 - Semester 1 [Numeric S1])
        for ($i = 1; $i <= 10; $i++) {
            $isRep = ($i <= 2);
            $user = User::create([
                'name' => "Junior Student " . str_pad($i, 2, '0', STR_PAD_LEFT),
                'email' => "junior{$i}@atijaffna.lk",
                'password' => Hash::make('password'),
                'role' => $isRep ? 'rep' : 'student',
            ]);
            $reg = "ATI/HNDIT/2025/" . str_pad($i, 3, '0', STR_PAD_LEFT);
            Student::create([
                'user_id' => $user->id,
                'registration_number' => $reg,
                'nic_number' => "2003" . str_pad($i, 5, '0', STR_PAD_LEFT) . "V",
                'date_of_birth' => "2003-01-01",
                'gender' => $i % 2 == 0 ? 'female' : 'male',
                'batch_id' => $juniorBatch->id,
                'current_semester_id' => $semesters[0]->id, // Year 1 - Sem 1 (S1)
                'qr_code_data' => json_encode(['reg' => $reg, 'id' => $user->id, 'type' => 'student']),
                'status' => 'active',
            ]);
        }
    }
}
