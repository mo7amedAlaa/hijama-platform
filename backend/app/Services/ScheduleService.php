<?php

namespace App\Services;

use App\Models\WorkSchedule;
use App\Models\BlockedSlots;
use App\Models\Booking;
use Carbon\Carbon;

class ScheduleService
{
    /**
     * جميع المواعيد ليوم محدد
     */
    public function getSlotsForDate(string $date): array
    {
        $carbon = Carbon::parse($date);
        $dayOfWeek = $carbon->dayOfWeek;

        $schedule = WorkSchedule::where('day_of_week', $dayOfWeek)
            ->where('is_active', true)
            ->first();

        if (!$schedule) {
            return [];
        }

        $isFullDayBlocked = BlockedSlots::where('date', $date)
            ->whereNull('start_time')
            ->exists();

        if ($isFullDayBlocked) {
            return [];
        }

        $blockedTimes = BlockedSlots::where('date', $date)
            ->whereNotNull('start_time')
            ->pluck('start_time')
            ->map(fn($time) => substr($time, 0, 5))
            ->toArray();

        $bookings = Booking::whereIn('status', ['pending', 'confirmed'])
            ->where('appointment_date', $date)
            ->get([
                'appointment_start',
                'appointment_end'
            ]);

        $slots = $this->generateTimeSlots(
            $schedule->start_time,
            $schedule->end_time,
            $schedule->slot_duration
        );

        return collect($slots)
            ->map(function ($slot) use ($date, $blockedTimes, $bookings) {
                return [
                    'date' => $date,
                    'start_time' => $slot['start'],
                    'end_time' => $slot['end'],
                    'is_available' => !$this->isOverlapping(
                        $slot['start'],
                        $slot['end'],
                        $blockedTimes,
                        $bookings
                    ),
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * المواعيد المتاحة فقط
     */
    public function getAvailableSlotsForDate(string $date): array
    {
        return array_values(
            array_filter(
                $this->getSlotsForDate($date),
                fn($slot) => $slot['is_available']
            )
        );
    }

    /**
     * التحقق من توفر Slot محدد
     */
    public function isSlotAvailable(
        string $date,
        string $startTime
    ): bool {
        return collect($this->getSlotsForDate($date))
            ->contains(function ($slot) use ($startTime) {
                return $slot['start_time'] === $startTime
                    && $slot['is_available'];
            });
    }

    /**
     * جلب Slots لعدة أيام
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
     * إنشاء Slots حسب مدة الجلسة
     */
    private function generateTimeSlots(
        string $start,
        string $end,
        int $duration = 60
    ): array {
        $slots = [];

        $current = strtotime($start);
        $endTime = strtotime($end);

        while ($current < $endTime) {
            $next = strtotime("+{$duration} minutes", $current);

            if ($next > $endTime) {
                break;
            }

            $slots[] = [
                'start' => date('H:i', $current),
                'end' => date('H:i', $next),
            ];

            $current = $next;
        }

        return $slots;
    }

    /**
     * التحقق من وجود تداخل
     */
    private function isOverlapping(
        string $slotStart,
        string $slotEnd,
        array $blockedTimes,
        $bookings
    ): bool {

        if (in_array($slotStart, $blockedTimes)) {
            return true;
        }

        $slotStartTs = strtotime($slotStart);
        $slotEndTs = strtotime($slotEnd);

        foreach ($bookings as $booking) {

            $bookingStartTs = strtotime($booking->appointment_start);
            $bookingEndTs = strtotime($booking->appointment_end);

            if (
                $slotStartTs < $bookingEndTs &&
                $slotEndTs > $bookingStartTs
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * التحقق من توفر فترة زمنية كاملة
     */
    public function isRangeAvailable(
        string $date,
        string $start,
        string $end
    ): bool {

        $startTs = strtotime($start);
        $endTs = strtotime($end);

        $bookings = Booking::whereIn('status', ['pending', 'confirmed'])
            ->where('appointment_date', $date)
            ->get([
                'appointment_start',
                'appointment_end'
            ]);

        foreach ($bookings as $booking) {

            $bookingStartTs = strtotime($booking->appointment_start);
            $bookingEndTs = strtotime($booking->appointment_end);

            if (
                $startTs < $bookingEndTs &&
                $endTs > $bookingStartTs
            ) {
                return false;
            }
        }

        return true;
    }
}
