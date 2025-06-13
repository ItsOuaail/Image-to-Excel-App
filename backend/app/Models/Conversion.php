<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversion extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'original_filename',
        'image_path',
        'excel_path',
        'status',
        'extracted_data',
        'error_message'
    ];

    protected $casts = [
        'extracted_data' => 'array'
    ];

    public function getImageUrlAttribute()
    {
        return asset('storage/' . $this->image_path);
    }

    public function getExcelUrlAttribute()
    {
        return $this->excel_path ? asset('storage/' . $this->excel_path) : null;
    }

    // Relationship with user
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}