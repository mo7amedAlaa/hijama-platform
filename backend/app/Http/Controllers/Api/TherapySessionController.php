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
    'icon'             => 'nullable',
]);
        if ($request->hasFile('icon')) {
    $path = $request->file('icon')->store('sessions', 'public');
    $data['icon'] = $path;
}
        return response()->json(TherapySession::create($data), 201);
    }

    // PUT /api/sessions/{id}  (Admin فقط)
    public function update(Request $request, TherapySession $therapySession)
{
    $data = $request->validate([
        'name'             => 'sometimes|string',
        'name_ar'          => 'sometimes|string',
        'description'      => 'nullable|string',
        'duration_minutes' => 'sometimes|integer|min:15',
        'price'            => 'sometimes|numeric|min:0',
        'is_active'        => 'sometimes|boolean',
        'icon'             => 'nullable',
    ]);

    if ($request->hasFile('icon')) {
        $path = $request->file('icon')->store('sessions', 'public');
        $data['icon'] = $path;
    }

    $therapySession->update($data);

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
        ->where(function ($q) {
            $q->whereDate('appointment_date', '>', today())
              ->orWhere(function ($q) {
                  $q->whereDate('appointment_date', today())
                    ->whereTime('appointment_start', '>=', now()->format('H:i:s'));
              });
        })
        ->orderBy('appointment_date')
        ->orderBy('appointment_start')
        ->with('therapySession')
        ->first();

    return response()->json([
        'booking' => $booking
    ]);
}


}
