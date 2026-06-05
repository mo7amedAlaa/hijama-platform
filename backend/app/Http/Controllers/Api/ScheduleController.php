<?php
// app/Http/Controllers/Api/ScheduleController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WorkSchedule;
use App\Models\BlockedSlots;
use App\Services\ScheduleService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ScheduleController extends Controller
{
    public function __construct(
        private readonly ScheduleService $scheduleService
    ) {}

    // =========================================================
    // جدول العمل الأسبوعي
    // =========================================================

    /**
     * GET /api/admin/work-schedule
     * يرجع جدول العمل لكل أيام الأسبوع
     *
     * Response:
     * [
     *   { day_of_week: 0, start_time: "08:00", end_time: "20:00",
     *     slot_duration: 60, is_active: true },
     *   ...
     * ]
     */
    public function getWorkSchedule(): JsonResponse
    {
        $schedules = WorkSchedule::orderBy('day_of_week')->get();
        return response()->json($schedules);
    }

    /**
     * PUT /api/admin/work-schedule
     * يحدّث جدول العمل كله دفعة واحدة
     *
     * Body:
     * {
     *   "schedules": [
     *     { "day_of_week": 0, "start_time": "08:00",
     *       "end_time": "20:00", "slot_duration": 60, "is_active": true },
     *     { "day_of_week": 5, "is_active": false, ... }
     *   ]
     * }
     */
    public function updateWorkSchedule(Request $request): JsonResponse
{
    $data = $request->validate([
        'schedules'                 => 'required|array',
        'schedules.*.day_of_week'   => 'required|integer|between:0,6',
        'schedules.*.start_time'    => [
            'required',
            'regex:/^\d{2}:\d{2}(:\d{2})?$/'
        ],
        'schedules.*.end_time'      => [
            'required',
            'regex:/^\d{2}:\d{2}(:\d{2})?$/'
        ],
        'schedules.*.slot_duration' => 'required|integer',
        'schedules.*.is_active'     => 'required|boolean',
    ]);

    foreach ($data['schedules'] as $row) {

        // 🔥 توحيد الصيغة إلى H:i:s دائمًا
        $row['start_time'] = strlen($row['start_time']) === 5
            ? $row['start_time'] . ':00'
            : $row['start_time'];

        $row['end_time'] = strlen($row['end_time']) === 5
            ? $row['end_time'] . ':00'
            : $row['end_time'];

        // 🔥 مقارنة الوقت بعد التوحيد
        if (strtotime($row['end_time']) <= strtotime($row['start_time'])) {
            return response()->json([
                'message' => "End time must be after start time for day {$row['day_of_week']}"
            ], 422);
        }

        WorkSchedule::updateOrCreate(
            ['day_of_week' => $row['day_of_week']],
            $row
        );
    }

    return response()->json([
        'message'   => 'تم تحديث جدول العمل بنجاح',
        'schedules' => WorkSchedule::orderBy('day_of_week')->get(),
    ]);
}

    // =========================================================
    // تعطيل أوقات أو أيام بعينها
    // =========================================================

    /**
     * GET /api/admin/blocked-slots
     * كل الأوقات والأيام المعطلة
     *
     * Response:
     * [
     *   { id: 1, date: "2025-06-27", start_time: null,    reason: "إجازة رسمية" },
     *   { id: 2, date: "2025-06-30", start_time: "14:00", reason: "صيانة"       },
     * ]
     */
    public function getBlockedSlots(): JsonResponse
    {
        $blocked = BlockedSlots::orderBy('date')
                              ->orderBy('start_time')
                              ->get();

        return response()->json($blocked);
    }

    /**
     * POST /api/admin/blocked-slots
     * تعطيل وقت محدد أو يوم كامل
     *
     * Body — تعطيل وقت واحد:
     * { "date": "2025-06-30", "start_time": "14:00", "reason": "صيانة" }
     *
     * Body — تعطيل يوم كامل (start_time = null):
     * { "date": "2025-06-27", "reason": "إجازة رسمية" }
     */
    public function blockSlot(Request $request): JsonResponse
    {
        $data = $request->validate([
            'date'       => 'required|date|after_or_equal:today',
            'start_time' => 'nullable|date_format:H:i',
            'reason'     => 'nullable|string|max:255',
        ]);

        // firstOrCreate → لو موجود مسبقاً ما يتكرر
        $blocked = BlockedSlots::firstOrCreate(
            [
                'date'       => $data['date'],
                'start_time' => $data['start_time'] ?? null,
            ],
            ['reason' => $data['reason'] ?? null]
        );

        return response()->json($blocked, 201);
    }

    /**
     * DELETE /api/admin/blocked-slots/{blockedSlot}
     * إلغاء التعطيل وإعادة الوقت/اليوم متاحاً
     *
     * URL: /api/admin/blocked-slots/2
     */
  public function unblockSlot(BlockedSlots $blockedSlot): JsonResponse
{
    $id = $blockedSlot->id;

    $blockedSlot->delete();

    return response()->json([
        'message' => 'تم الحذف',
        'exists_after_delete' => BlockedSlots::find($id),
        'all' => BlockedSlots::all()
    ]);
}

    // =========================================================
    // إحصائيات المواعيد (للداشبورد)
    // =========================================================

    /**
     * GET /api/admin/slots/stats
     * إحصائيات سريعة عن المواعيد
     *
     * Response:
     * {
     *   today:      { available: 6, booked: 2 },
     *   this_week:  { available: 38, booked: 10 },
     *   this_month: { total_bookings: 45, pending: 5, confirmed: 30, ... }
     * }
     */
    public function slotsStats(): JsonResponse
    {
        $today     = now()->toDateString();
        $weekStart = now()->startOfWeek()->toDateString();
        $weekEnd   = now()->endOfWeek()->toDateString();

        // مواعيد اليوم
        $todaySlots = $this->scheduleService->getSlotsForDate($today);

        // حجوزات هذا الشهر من الـ DB
        $monthlyBookings = \App\Models\Booking::whereMonth(
            'appointment_date', now()->month
        )->selectRaw('status, count(*) as count')
         ->groupBy('status')
         ->pluck('count', 'status');

        return response()->json([
            'today' => [
                'available' => collect($todaySlots)->where('is_available', true)->count(),
                'booked'    => collect($todaySlots)->where('is_available', false)->count(),
            ],
            'this_month' => [
                'total'     => $monthlyBookings->sum(),
                'pending'   => $monthlyBookings->get('pending',   0),
                'confirmed' => $monthlyBookings->get('confirmed', 0),
                'completed' => $monthlyBookings->get('completed', 0),
                'cancelled' => $monthlyBookings->get('cancelled', 0),
            ],
            'blocked_days' => BlockedSlots::where('date', '>=', $today)
                                         ->whereNull('start_time')
                                         ->count(),
        ]);
    }
}
