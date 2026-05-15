<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FileUpload extends Model
{
    protected $fillable = [
        'uploaded_by', 'subject_id', 'semester_id', 'type',
        'title', 'original_name', 'file_path', 'file_size', 'mime_type',
    ];

    public function uploader() { return $this->belongsTo(User::class, 'uploaded_by'); }
    public function subject() { return $this->belongsTo(Subject::class); }
    public function semester() { return $this->belongsTo(Semester::class); }
}
