<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Result extends Model
{
    protected $fillable = [
        'student_id', 'subject_id', 'semester_id',
        'continuous_assessment', 'final_exam', 'total_marks',
        'grade', 'grade_point', 'is_published',
    ];

    protected function casts(): array
    {
        return [
            'continuous_assessment' => 'decimal:2',
            'final_exam' => 'decimal:2',
            'total_marks' => 'decimal:2',
            'grade_point' => 'decimal:2',
            'is_published' => 'boolean',
        ];
    }

    public function student() { return $this->belongsTo(Student::class); }
    public function subject() { return $this->belongsTo(Subject::class); }
    public function semester() { return $this->belongsTo(Semester::class); }

    public static function calculateGrade(float $totalMarks): array
    {
        return match(true) {
            $totalMarks >= 85 => ['grade' => 'A+', 'point' => 4.00],
            $totalMarks >= 75 => ['grade' => 'A',  'point' => 4.00],
            $totalMarks >= 70 => ['grade' => 'A-', 'point' => 3.70],
            $totalMarks >= 65 => ['grade' => 'B+', 'point' => 3.30],
            $totalMarks >= 60 => ['grade' => 'B',  'point' => 3.00],
            $totalMarks >= 55 => ['grade' => 'B-', 'point' => 2.70],
            $totalMarks >= 50 => ['grade' => 'C+', 'point' => 2.30],
            $totalMarks >= 45 => ['grade' => 'C',  'point' => 2.00],
            $totalMarks >= 40 => ['grade' => 'C-', 'point' => 1.70],
            $totalMarks >= 35 => ['grade' => 'D+', 'point' => 1.30],
            $totalMarks >= 30 => ['grade' => 'D',  'point' => 1.00],
            default           => ['grade' => 'F',  'point' => 0.00],
        };
    }
}
