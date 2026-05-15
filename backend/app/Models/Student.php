<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'registration_number', 'nic_number', 'date_of_birth',
        'gender', 'address', 'batch_id', 'current_semester_id',
        'qr_code_data', 'id_card_pdf_path', 'status',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }

    public function currentSemester()
    {
        return $this->belongsTo(Semester::class, 'current_semester_id');
    }

    public function attendanceRecords()
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class);
    }

    public function results()
    {
        return $this->hasMany(Result::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }
}
