<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TherapySession;
use Illuminate\Http\Request;

class TherapySessionController extends Controller
{
    // GET /api/sessions  (عام للجميع)
    public function index()
    {
        return response()->json(
            TherapySession::where('is_active', true)->get()
        );
    }
    public function all()
    {
        return response()->json(
            TherapySession::all()
        );
    }

    // POST /api/sessions  (Admin فقط)
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'             => 'required|string',
            'name_ar'          => 'required|string',
            'description'      => 'nullable|string',
            'duration_minutes' => 'integer|min:15',
            'price'            => 'numeric|min:0',
        ]);

        return response()->json(TherapySession::create($data), 201);
    }

    // PUT /api/sessions/{id}  (Admin فقط)
    public function update(Request $request, TherapySession $therapySession)
    {
        $therapySession->update($request->validate([
            'name'             => 'sometimes|string',
            'name_ar'          => 'sometimes|string',
            'description'      => 'nullable|string',
            'duration_minutes' => 'sometimes|integer|min:15',
            'price'            => 'sometimes|numeric|min:0',
            'is_active'        => 'sometimes|boolean',
        ]));

        return response()->json($therapySession);
    }

    public function destroy(TherapySession $therapySession)
    {
        $therapySession->delete();
        return response()->json(['message' => 'تم الحذف']);
    }

    public function nextSession(Request $request)
{
    $user = $request->user();

    $booking = $user->bookings()
        ->whereIn('status', ['pending', 'confirmed'])
        ->whereHas('slot', function ($q) {
            $q->whereDate('date', '>=', now()->toDateString());
        })
        ->with(['slot', 'therapySession'])
        ->get()
        ->sortBy(function ($b) {
            return $b->slot->date . ' ' . $b->slot->start_time;
        })
        ->first();

    return response()->json([
        'booking' => $booking
    ]);
}


}
