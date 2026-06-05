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
        'conditions'         => 'nullable|array',
        'conditions.*'       => 'string',
        'goals'              => 'nullable|array',
        'goals.*'            => 'string',
        'pain_level'         => 'nullable|string',
        'injury_location'    => 'nullable|string|max:255',
    ]);

     $session = \App\Models\TherapySession::findOrFail($data['therapy_session_id']);
    $duration = $session->duration_minutes; // بالدقيقة

     $start = Carbon::createFromFormat('H:i', $data['appointment_start']);
    $end   = $start->copy()->addMinutes($duration);
    $data['appointment_end'] = $end->format('H:i');

    if (!$this->scheduleService->isRangeAvailable(
        $data['appointment_date'],
        $data['appointment_start'],
        $data['appointment_end']
    )) {
        return response()->json([
            'message' => 'هذا الموعد غير متاح أو محجوز، اختر وقت آخر.',
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
            throw new \Exception('هذا الموعد غير متاح.');
        }

        return Booking::create([
            ...$data,
            'user_id' => $request->user()->id,
            'status'  => 'pending',
        ]);
    });

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
