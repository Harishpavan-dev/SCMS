<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'user_id', 'type', 'title', 'message', 'data', 'is_read', 'sent_via_fcm',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'json',
            'is_read' => 'boolean',
            'sent_via_fcm' => 'boolean',
        ];
    }

    public function user() { return $this->belongsTo(User::class); }
}
