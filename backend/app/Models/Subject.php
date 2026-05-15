<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'credit_hours',
        'description',
        'semester_id',
    ];

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    public function semesterSubjects()
    {
        return $this->hasMany(SemesterSubject::class);
    }

    public function classSessions()
    {
        return $this->hasMany(ClassSession::class);
    }

    public function results()
    {
        return $this->hasMany(Result::class);
    }

    public function fileUploads()
    {
        return $this->hasMany(FileUpload::class);
    }
}
