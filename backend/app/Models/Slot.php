<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Slot extends Model
{
    use HasFactory;

    protected $fillable = [
        'date', 'start_time', 'end_time', 'is_available',
    ];

    protected $casts = [
        'date'         => 'date',
        'is_available' => 'boolean',
    ];

    public function booking()
    {
        return $this->hasOne(Booking::class);
    }

    // Scope: مواعيد متاحة فقط
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    // Scope: فلتر بالتاريخ
    public function scopeOnDate($query, $date)
    {
        return $query->whereDate('date', $date);
    }
}
