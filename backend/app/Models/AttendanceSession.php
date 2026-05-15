<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceSession extends Model
{
    protected $fillable = [
        'class_session_id', 'qr_code', 'qr_expires_at', 'created_by', 'status',
    ];

    protected function casts(): array
    {
        return ['qr_expires_at' => 'datetime'];
    }

    public function classSession() { return $this->belongsTo(ClassSession::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }

    public function records()
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    public function isExpired(): bool
    {
        return now()->greaterThan($this->qr_expires_at);
    }

    public function isActive(): bool
    {
        return $this->status === 'active' && !$this->isExpired();
    }
}
