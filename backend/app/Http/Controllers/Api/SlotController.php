<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ScheduleService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SlotController extends Controller
{
    public function __construct(
        private readonly ScheduleService $scheduleService
    ) {}

    /**
     * GET /api/slots?date=2025-06-25
     * يرجع كل المواعيد (متاح + محجوز) ليوم واحد
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'required|date|after_or_equal:today',
        ]);

        $slots = $this->scheduleService->getSlotsForDate($request->date);

        return response()->json([
            'date'      => $request->date,
            'slots'     => $slots,
            'available' => collect($slots)->where('is_available', true)->count(),
            'booked'    => collect($slots)->where('is_available', false)->count(),
        ]);
    }

    /**
     * POST /api/slots/batch
     * يرجع مواعيد أيام متعددة دفعة واحدة
     * body: { dates: ["2025-06-25", "2025-06-27", "2025-06-30"] }
     */
    public function batch(Request $request): JsonResponse
    {
        $request->validate([
            'dates'   => 'required|array|min:1|max:31',
            'dates.*' => 'date|after_or_equal:today',
        ]);

        $data = $this->scheduleService->getSlotsForDates($request->dates);

        return response()->json($data);
    }
}
