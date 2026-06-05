<?php

namespace App\Services;

use App\Models\WorkSchedule;
use App\Models\BlockedSlots;
use App\Models\Booking;
use Carbon\Carbon;

class ScheduleService
{
    /**
     * كل المواعيد ليوم معين (متاح + محجوز)
     */
    public function getSlotsForDate(string $date): array
    {
        $carbon    = Carbon::parse($date);
        $dayOfWeek = $carbon->dayOfWeek;

        // ── 1. جدول العمل ─────────────────────
        $schedule = WorkSchedule::where('day_of_week', $dayOfWeek)
            ->where('is_active', true)
            ->first();

        if (!$schedule) return [];

        // ── 2. اليوم كامل معطل؟ ────────────────
        $isFullDayBlocked = BlockedSlots::where('date', $date)
            ->whereNull('start_time')
            ->exists();

        if ($isFullDayBlocked) return [];

        // ── 3. الأوقات المعطلة ─────────────────
        $blockedTimes = BlockedSlots::where('date', $date)
            ->whereNotNull('start_time')
            ->pluck('start_time')
            ->map(fn($t) => substr($t, 0, 5))
            ->toArray();

        // ── 4. الحجوزات (IMPORTANT: range not single time)
        $bookings = Booking::whereIn('status', ['pending', 'confirmed'])
            ->where('appointment_date', $date)
            ->get(['appointment_start', 'appointment_end']);

        // ── 5. توليد السلاوتس ─────────────────
        $slots = $this->generateTimeSlots(
            $schedule->start_time,
            $schedule->end_time,
            $schedule->slot_duration
        );

        return collect($slots)
            ->map(fn($slot) => [
                'date'         => $date,
                'start_time'   => $slot['start'],
                'end_time'     => $slot['end'],
                'is_available' => !$this->isOverlapping(
                    $slot['start'],
                    $slot['end'],
                    $blockedTimes,
                    $bookings
                ),
            ])
            ->values()
            ->toArray();
    }

    /**
     * مواعيد متاحة فقط
     */
    public function getAvailableSlotsForDate(string $date): array
    {
        return array_filter(
            $this->getSlotsForDate($date),
            fn($s) => $s['is_available']
        );
    }

    /**
     * تحقق من توافر وقت معين
     */
    public function isSlotAvailable(string $date, string $startTime): bool
    {
        return collect($this->getSlotsForDate($date))
            ->contains(fn($s) =>
                $s['start_time'] === $startTime && $s['is_available']
            );
    }

    /**
     * مواعيد متعددة
     */
    public function getSlotsForDates(array $dates): array
    {
        $result = [];

        foreach ($dates as $date) {
            $slots = $this->getSlotsForDate($date);
            if (!empty($slots)) {
                $result[$date] = $slots;
            }
        }

        return $result;
    }

    /**
     * توليد السلووتس
     */
    private function generateTimeSlots(string $start, string $end, int $duration = 60): array
    {
        $slots = [];

        $current = strtotime($start);
        $endTime = strtotime($end);

        while ($current < $endTime) {
            $next = strtotime("+{$duration} minutes", $current);

            if ($next > $endTime) break;

            $slots[] = [
                'start' => date('H:i', $current),
                'end'   => date('H:i', $next),
            ];

            $current = $next;
        }

        return $slots;
    }

    /**
     * 🔥 أهم جزء: منع التداخل (Overlap Detection)
     */
    private function isOverlapping(
        string $slotStart,
        string $slotEnd,
        array $blockedTimes,
        $bookings
    ): bool {
        // 1. blocked times (single time slots)
        if (in_array($slotStart, $blockedTimes)) {
            return true;
        }

        // 2. bookings (time range overlap)
        foreach ($bookings as $b) {
            if (
                $slotStart < substr($b->appointment_end, 0, 5) &&
                $slotEnd   > substr($b->appointment_start, 0, 5)
            ) {
                return true;
            }
        }

        return false;
    }
    public function isRangeAvailable(string $date, string $start, string $end): bool
{
    $bookings = Booking::whereIn('status', ['pending', 'confirmed'])
        ->where('appointment_date', $date)
        ->get(['appointment_start', 'appointment_end']);

    foreach ($bookings as $b) {
        if ($start < $b->appointment_end && $end > $b->appointment_start) {
            return false;
        }
    }

    return true;
}
}
