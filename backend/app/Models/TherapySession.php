<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TherapySession extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'name_ar', 'description',
        'duration_minutes', 'price', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'price'     => 'float',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}

