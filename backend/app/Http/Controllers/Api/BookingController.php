<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\ScheduleService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BookingController extends Controller
{
    public function __construct(
        private readonly ScheduleService $scheduleService
    ) {}

    // ── GET /api/bookings ─────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $bookings = $user->isAdmin()
            ? Booking::with(['user', 'therapySession'])
                     ->latest()->paginate(20)
            : Booking::with(['therapySession'])
                     ->where('user_id', $user->id)
                     ->latest()->paginate(20);

        return response()->json($bookings);
    }

    // ── GET /api/my-bookings ──────────────────────────────
    public function myBookings(Request $request): JsonResponse
    {
        $bookings = Booking::with(['therapySession'])
            ->where('user_id', $request->user()->id)
            ->orderByDesc('appointment_date')
            ->orderByDesc('appointment_time')
            ->get();

        return response()->json($bookings);
    }

    // ── POST /api/bookings ────────────────────────────────
public function store(Request $request): JsonResponse
{
    $data = $request->validate([
        'therapy_session_id' => 'required|exists:therapy_sessions,id',
        'appointment_date'   => 'required|date|after_or_equal:today',
        'appointment_start'  => 'required|date_format:H:i',
        'notes'              => 'nullable|string|max:500',
        'complaints'         => 'nullable|array',
        'complaints.*'       => 'string',
        'conditions'         => 'required|array',
        'conditions.*'       => 'string',
        'goals'              => 'required|array',
        'goals.*'            => 'string',
        'pain_level'         => 'nullable|string',
        'injury_location'    => 'nullable|string|max:255',
        'gender'             => 'required|in:male,female',
        'rehab_timing'       => 'nullable|in:before,after',
        'blood_thinner'      => 'required|boolean',
    ], [
        'therapy_session_id.required' => 'جلسة العلاج مطلوبة.',
        'therapy_session_id.exists'   => 'جلسة العلاج غير موجودة.',

        'appointment_date.required'   => 'تاريخ الموعد مطلوب.',
        'appointment_date.date'       => 'تاريخ الموعد غير صالح.',
        'appointment_date.after_or_equal' => 'لا يمكن اختيار تاريخ في الماضي.',

        'appointment_start.required'  => 'وقت بدء الموعد مطلوب.',
        'appointment_start.date_format' => 'صيغة الوقت غير صحيحة.',

        'complaints.required' => 'يجب إدخال الشكاوى.',
        'conditions.required' => 'يجب إدخال الحالات.',
        'goals.required'      => 'يجب إدخال الأهداف.',

        'gender.required'     => 'الجنس مطلوب.',
        'gender.in'           => 'قيمة الجنس غير صحيحة.',

        'rehab_timing.required' => 'وقت التأهيل مطلوب.',
        'rehab_timing.in'       => 'قيمة وقت التأهيل غير صحيحة.',

        'blood_thinner.required' => 'حقل مميعات الدم مطلوب.',
        'blood_thinner.boolean'  => 'قيمة مميعات الدم يجب أن تكون صحيحة أو خاطئة.',
    ]);

    $session = \App\Models\TherapySession::findOrFail($data['therapy_session_id']);
    $duration = $session->duration_minutes;

    $start = Carbon::createFromFormat('H:i', $data['appointment_start']);
    $end   = $start->copy()->addMinutes($duration);

    $data['appointment_end'] = $end->format('H:i');

    if (!$this->scheduleService->isRangeAvailable(
        $data['appointment_date'],
        $data['appointment_start'],
        $data['appointment_end']
    )) {
        return response()->json([
            'message' => 'الوقت المختار غير متاح، اختر وقت آخر.',
            'error'   => 'TIME_SLOT_NOT_AVAILABLE'
        ], 422);
    }

    $booking = DB::transaction(function () use ($data, $request) {

        $exists = Booking::whereIn('status', ['pending', 'confirmed'])
            ->where('appointment_date', $data['appointment_date'])
            ->where(function ($q) use ($data) {
                $q->where('appointment_start', '<', $data['appointment_end'])
                  ->where('appointment_end',   '>', $data['appointment_start']);
            })
            ->lockForUpdate()
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'هذا الموعد محجوز بالفعل.',
                'error'   => 'APPOINTMENT_CONFLICT'
            ], 409);
        }

        return Booking::create([
            ...$data,
            'user_id' => $request->user()->id,
            'status'  => 'pending',
        ]);
    });

    if ($booking instanceof JsonResponse) {
        return $booking;
    }

    return response()->json(
        $booking->load('therapySession'),
        201
    );
}

    // ── GET /api/bookings/{id} ────────────────────────────
    public function show(Request $request, Booking $booking): JsonResponse
    {
        $this->authorize($request->user(), $booking);
        return response()->json($booking->load(['user', 'therapySession']));
    }

    // ── PUT /api/bookings/{id} ────────────────────────────
    public function update(Request $request, Booking $booking): JsonResponse
    {
        $this->authorize($request->user(), $booking);

        $data = $request->validate([
            'status' => 'sometimes|in:pending,confirmed,cancelled,completed',
            'notes'  => 'nullable|string|max:500',
        ]);

        $booking->update($data);
        return response()->json($booking->load('therapySession'));
    }

    // ── DELETE /api/bookings/{id} ─────────────────────────
    public function destroy(Request $request, Booking $booking): JsonResponse
    {
        $this->authorize($request->user(), $booking);

        // العميل يقدر يلغي فقط لو pending أو confirmed
        if (!$request->user()->isAdmin()) {
            if (!in_array($booking->status, ['pending', 'confirmed'])) {
                return response()->json(['message' => 'لا يمكن إلغاء هذا الحجز'], 422);
            }
            $booking->update(['status' => 'cancelled']);
        } else {
            $booking->delete();  // الأدمن يحذف نهائياً
        }

        return response()->json(['message' => 'تم بنجاح']);
    }

    // ─────────────────────────────────────────────────────
    private function authorize($user, Booking $booking): void
    {
        if (!$user->isAdmin() && $booking->user_id !== $user->id) {
            abort(403, 'غير مصرح');
        }
    }
   public function shows(Booking $booking)
{
    return response()->json(
        $booking->load([
            'user',
            'therapySession'
        ])
    );
}

}
