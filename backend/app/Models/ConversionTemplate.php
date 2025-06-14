<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConversionTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'columns',
        'description',
        'is_default'
    ];

    protected $casts = [
        'columns' => 'array',
        'is_default' => 'boolean'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function conversions()
    {
        return $this->hasMany(Conversion::class, 'template_id');
    }

    public function getColumnNames()
    {
        return array_column($this->columns, 'name');
    }
}