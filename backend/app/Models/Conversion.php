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
        'error_message',
        'template_id'
    ];

    protected $casts = [
        'template_id' => 'integer'  // Only cast template_id to integer
        // Removed extracted_data casting - it should be plain text
    ];

    public function getImageUrlAttribute()
    {
        return asset('storage/' . $this->image_path);
    }

    public function getExcelUrlAttribute()
    {
        return $this->excel_path ? asset('storage/' . $this->excel_path) : null;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function template()
    {
        return $this->belongsTo(ConversionTemplate::class, 'template_id');
    }
}