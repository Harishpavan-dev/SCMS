<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClassSession extends Model
{
    protected $fillable = [
        'subject_id', 'lecturer_id', 'semester_id', 'batch_id',
        'date', 'period', 'start_time', 'end_time', 'room', 'status',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'start_time' => 'datetime:H:i',
            'end_time' => 'datetime:H:i',
        ];
    }

    public function subject() { return $this->belongsTo(Subject::class); }
    public function lecturer() { return $this->belongsTo(Lecturer::class); }
    public function semester() { return $this->belongsTo(Semester::class); }
    public function batch() { return $this->belongsTo(Batch::class); }

    public function records()
    {
        return $this->hasMany(AttendanceRecord::class);
    }
}
