<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(User::latest()->paginate(20));
    }
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function show(User $user)
    {
        return response()->json($user->load('bookings.therapySession'));
    }
public function update(Request $request)
{
    $user = $request->user();

    $validated = $request->validate([
        'name'   => 'sometimes|string|max:255',
        'phone'  => 'nullable|string|max:20',
        'age'    => 'nullable|integer',
        'weight' => 'nullable|numeric',
        'password' => 'nullable|string|min:6',
    ]);

    if (!empty($validated['password'])) {
        $validated['password'] = bcrypt($validated['password']);
    } else {
        unset($validated['password']);
    }

    $user->update($validated);

    return response()->json([
        'message' => 'Profile updated successfully',
        'user' => $user->fresh()
    ]);

}
public function deleteUser($id)
{
    $user = User::findOrFail($id);

    if ($user->role === 'admin') {
        return response()->json([
            'message' => 'لا يمكن حذف الأدمن'
        ], 403);
    }

    $user->delete();

    return response()->json([
        'message' => 'تم الحذف بنجاح'
    ]);
}
}
