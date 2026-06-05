<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WorkSchedule;
use Illuminate\Http\Request;

class WorkScheduleController extends Controller
{
    // 📌 GET all schedules
    public function index()
    {
        return response()->json(
            WorkSchedule::orderBy('day_of_week')->get()
        );
    }

    // 📌 GET single schedule
    public function show($id)
    {
        return response()->json(
            WorkSchedule::findOrFail($id)
        );
    }

    // 📌 CREATE
    public function store(Request $request)
    {
        $data = $request->validate([
            'day_of_week'   => 'required|integer|between:0,6',
            'start_time'    => 'required ',
            'end_time'      => 'required ',
            'slot_duration' => 'required|integer|min:15',
            'is_active'     => 'boolean'
        ]);

        $schedule = WorkSchedule::create($data);

        return response()->json($schedule, 201);
    }

    // 📌 UPDATE
    public function update(Request $request, $id)
    {
        $schedule = WorkSchedule::findOrFail($id);

        $data = $request->validate([
            'day_of_week'   => 'sometimes|integer|between:0,6',
            
            'slot_duration' => 'sometimes|integer|min:15',
            'is_active'     => 'sometimes|boolean'
        ]);

        $schedule->update($data);

        return response()->json($schedule);
    }

    // 📌 DELETE
    public function destroy($id)
    {
        $schedule = WorkSchedule::findOrFail($id);
        $schedule->delete();

        return response()->json([
            'message' => 'Deleted successfully'
        ]);
    }

    // 📌 Toggle active
    public function toggle($id)
    {
        $schedule = WorkSchedule::findOrFail($id);
        $schedule->is_active = !$schedule->is_active;
        $schedule->save();

        return response()->json($schedule);
    }
}
