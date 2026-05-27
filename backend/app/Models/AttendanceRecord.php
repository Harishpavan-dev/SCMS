<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceRecord extends Model
{
    protected $fillable = [
        'class_session_id', 'student_id', 'marked_at',
        'marked_by', 'method', 'status',
    ];

    protected function casts(): array
    {
        return ['marked_at' => 'datetime'];
    }

    public function classSession() { return $this->belongsTo(ClassSession::class); }
    public function student() { return $this->belongsTo(Student::class); }
    public function markedByUser() { return $this->belongsTo(User::class, 'marked_by'); }
}
