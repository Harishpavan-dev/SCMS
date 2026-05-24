<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lecturer extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'employee_id', 'department', 'specialization',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function classSessions()
    {
        return $this->hasMany(ClassSession::class);
    }

    public function semesterSubjects()
    {
        return $this->hasMany(SemesterSubject::class);
    }

    public function timetableEntries()
    {
        return $this->hasMany(TimetableEntry::class);
    }

    public function availabilities()
    {
        return $this->hasMany(LecturerAvailability::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'lecturer_subject')->withTimestamps();
    }
}
