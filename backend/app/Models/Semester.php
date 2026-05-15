<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Semester extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'number', 'start_date', 'end_date', 'is_active'];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'semester_subjects')
            ->withPivot('lecturer_id')
            ->withTimestamps();
    }

    public function semesterSubjects()
    {
        return $this->hasMany(SemesterSubject::class);
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'current_semester_id');
    }

    public function results()
    {
        return $this->hasMany(Result::class);
    }

    public function timetableEntries()
    {
        return $this->hasMany(TimetableEntry::class);
    }
}
