<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkSchedule extends Model
{
    protected $fillable = [
        'day_of_week', 'start_time', 'end_time',
        'slot_duration', 'is_active',
    ];

    protected $casts = ['is_active' => 'boolean'];

    /**
     * يولّد قائمة الـ slots بناءً على slot_duration
     *
     * مثال: 08:00 → 20:00 بمدة 60 دقيقة:
     * [
     *   { start: "08:00", end: "09:00" },
     *   { start: "09:00", end: "10:00" },
     *   { start: "10:00", end: "11:00" },
     *   ...
     * ]
     */
    public function generateTimeSlots(): array
    {
        $slots   = [];
        $current = strtotime($this->start_time);
        $end     = strtotime($this->end_time);
        $step    = $this->slot_duration * 60; // دقيقة → ثانية

        while ($current + $step <= $end) {
            $slots[] = [
                'start' => date('H:i', $current),
                'end'   => date('H:i', $current + $step),
            ];
            $current += $step;
        }

        return $slots;
    }
}
