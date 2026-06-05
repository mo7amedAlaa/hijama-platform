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
public function replay(Request $request, $id){
    $consultation = Consultation::findOrFail($id);
    $data = $request->validate([
        'doctor_reply' => 'required|string',
    ]);
    $data['status'] = 'ans';
    $consultation->update($data);
    return response()->json($consultation);
}
public function destroy(Request $request, $id){
    $consultation = Consultation::findOrFail($id);
    $consultation->delete();
    return response()->json(['message' => 'تم حذف الاستشارة بنجاح']);
}



}
