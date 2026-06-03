<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Slot;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    // GET /api/bookings  (Admin: الكل | Client: حجوزاته)
    public function index(Request $request)
    {
        $user = $request->user();

        $bookings = $user->isAdmin()
            ? Booking::with(['user', 'therapySession', 'slot'])->latest()->paginate(20)
            : Booking::with(['therapySession', 'slot'])
                     ->where('user_id', $user->id)
                     ->latest()->paginate(20);

        return response()->json($bookings);
    }

    // POST /api/bookings
    public function store(Request $request)
    {
        $data = $request->validate([
            'therapy_session_id' => 'required|exists:therapy_sessions,id',
            'slot_id'            => 'required|exists:slots,id',
            'notes'              => 'nullable|string',
            'complaints'         => 'nullable|array',
            'conditions'         => 'nullable|array',
            'goals'              => 'nullable|array',
            'pain_level'         => 'nullable|string',
            'injury_location'    => 'nullable|string',
            'injury_duration'    => 'nullable|string',
        ]);

        // تأكد أن الموعد متاح
        $slot = Slot::findOrFail($data['slot_id']);
        if (! $slot->is_available) {
            return response()->json(['message' => 'هذا الموعد غير متاح'], 422);
        }

        $data['user_id'] = $request->user()->id;
        $booking = Booking::create($data);

        // أغلق الموعد
        $slot->update(['is_available' => false]);

        return response()->json(
            $booking->load(['therapySession', 'slot']),
            201
        );
    }

    // GET /api/bookings/{id}
    public function show(Request $request, Booking $booking)
    {
        $this->authorizeBooking($request->user(), $booking);
        return response()->json($booking->load(['user', 'therapySession', 'slot']));
    }

    // PUT /api/bookings/{id}
    public function update(Request $request, Booking $booking)
    {
        $this->authorizeBooking($request->user(), $booking);

        $data = $request->validate([
            'status' => 'sometimes|in:pending,confirmed,cancelled,completed',
            'notes'  => 'nullable|string',
        ]);

        // لو الحجز اتلغى، أعد الموعد متاح
        if (isset($data['status']) && $data['status'] === 'cancelled') {
            $booking->slot->update(['is_available' => true]);
        }

        $booking->update($data);
        return response()->json($booking->load(['therapySession', 'slot']));
    }

    // DELETE /api/bookings/{id}
    public function destroy(Request $request, Booking $booking)
    {
        $this->authorizeBooking($request->user(), $booking);
        $booking->slot->update(['is_available' => true]);
        $booking->delete();
        return response()->json(['message' => 'تم إلغاء الحجز']);
    }

    // حجوزات المستخدم الحالي فقط
    public function myBookings(Request $request)
    {
        $bookings = Booking::with(['therapySession', 'slot'])
            ->where('user_id', $request->user()->id)
            ->latest()->get();

        return response()->json($bookings);
    }

    private function authorizeBooking($user, $booking)
    {
        if (! $user->isAdmin() && $booking->user_id !== $user->id) {
            abort(403, 'غير مصرح');
        }
    }
}
