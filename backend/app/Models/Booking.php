<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Booking extends Model
{
    protected $fillable = [
        'user_id', 'therapy_session_id',
        'appointment_date', 'appointment_time',   // ← بدل slot_id
        'status', 'booking_ref', 'notes',
        'complaints', 'conditions', 'goals',
        'pain_level', 'injury_location',
        'appointment_start', 'appointment_end',
         'gender',
        'rehab_timing',
        'blood_thinner',

    ];

    protected $casts = [
        'complaints'       => 'array',
        'conditions'       => 'array',
        'goals'            => 'array',
        'appointment_date' => 'date',
        'blood_thinner' => 'boolean',

    ];

    protected static function booted(): void
    {
        static::creating(function ($b) {
            $b->booking_ref = 'CS-' . strtoupper(\Illuminate\Support\Str::random(6));
        });
    }
public function slot()
    {
        return $this->belongsTo(Slot::class);
    }
    public function user()         { return $this->belongsTo(User::class); }
    public function therapySession(){ return $this->belongsTo(TherapySession::class); }
}
