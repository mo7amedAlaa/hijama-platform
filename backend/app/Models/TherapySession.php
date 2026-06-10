<?php

namespace App\Models;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TherapySession extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'name_ar', 'description',
        'duration_minutes', 'price', 'is_active',"icon"
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'price'     => 'float',
    ];
    protected $appends = ['icon_url'];


public function getIconUrlAttribute()
{
    return Storage::disk('public')->url($this->icon);
}
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}

