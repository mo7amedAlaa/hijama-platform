<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Consultation;

class ConsultationController extends Controller
{
public function store(Request $request)
{
    $data = $request->validate([
        'type' => 'required|in:voice,chat,video',
        'name' => 'required|string',
        'phone' => 'nullable|string',
        'message' => 'nullable|string',
    ]);

    $consultation = Consultation::create([
        ...$data,
        'user_id' => $request->user()->id,
        'status' => 'pending',
    ]);

    return response()->json([
        'message' => 'تم إرسال طلب الاستشارة بنجاح',
        'data' => $consultation,
    ]);
}

    public function index()
    {
        return Consultation::latest()->get();
    }
    public function myConsultations(Request $request)
{
    return Consultation::where('user_id', $request->user()->id)
        ->latest()
        ->get();
}

}
