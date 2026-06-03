<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Slot;
use Illuminate\Http\Request;

class SlotController extends Controller
{
    // GET /api/slots?date=2025-06-15
    public function index(Request $request)
    {
        $date = $request->query('date', now()->toDateString());

        $slots = Slot::available()->onDate($date)->orderBy('start_time')->get();

        return response()->json($slots);
    }

    // POST /api/slots  (Admin: ينشئ مواعيد)
    public function store(Request $request)
    {
        $data = $request->validate([
            'date'       => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time'   => 'required|date_format:H:i|after:start_time',
        ]);

        $slot = Slot::firstOrCreate(
            ['date' => $data['date'], 'start_time' => $data['start_time']],
            $data
        );

        return response()->json($slot, 201);
    }

    // POST /api/slots/bulk  (Admin: ينشئ مواعيد بالجملة)
    public function bulk(Request $request)
    {
        $request->validate([
            'date'       => 'required|date|after_or_equal:today',
            'start_hour' => 'required|integer|between:0,23',
            'end_hour'   => 'required|integer|between:0,23|gt:start_hour',
            'interval'   => 'required|integer|min:30',      // دقائق
        ]);

        $slots   = [];
        $current = $request->start_hour * 60;
        $end     = $request->end_hour   * 60;

        while ($current + $request->interval <= $end) {
            $start = sprintf('%02d:%02d', intdiv($current, 60), $current % 60);
            $next  = $current + $request->interval;
            $endT  = sprintf('%02d:%02d', intdiv($next, 60), $next % 60);

            $slots[] = Slot::firstOrCreate(
                ['date' => $request->date, 'start_time' => $start],
                ['end_time' => $endT, 'is_available' => true]
            );
            $current = $next;
        }

        return response()->json($slots, 201);
    }
}
