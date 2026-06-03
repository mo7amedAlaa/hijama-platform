<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'therapy_session_id', 'slot_id',
        'status', 'booking_ref', 'notes',
        'complaints', 'conditions', 'goals',
        'pain_level', 'injury_location', 'injury_duration',
    ];

    protected $casts = [
        'complaints' => 'array',
        'conditions' => 'array',
        'goals'      => 'array',
    ];

    // Auto-generate booking_ref
    protected static function booted(): void
    {
        static::creating(function ($booking) {
            $booking->booking_ref = 'CS-' . strtoupper(Str::random(6));
        });
    }

    // Relations
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function therapySession()
    {
        return $this->belongsTo(TherapySession::class);
    }

    public function slot()
    {
        return $this->belongsTo(Slot::class);
    }
}
