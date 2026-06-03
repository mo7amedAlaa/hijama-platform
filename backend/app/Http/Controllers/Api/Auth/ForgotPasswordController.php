<?php

namespace App\Http\Controllers\Api\Auth;
use Mail;
use App\Mail\ResetPasswordMail;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ForgotPasswordController extends Controller
{

public function __invoke(Request $request)
{
    $request->validate([
        'email' => 'required|email'
    ]);

    $token = Str::random(60);
    $hashedToken = hash('sha256', $token);

    DB::table('password_reset_tokens')->updateOrInsert(
        ['email' => $request->email],
        [
            'token' => $hashedToken,
            'created_at' => Carbon::now()
        ]
    );

    Mail::to($request->email)->send(
        new ResetPasswordMail($token, $request->email)
    );

    return response()->json([
        'message' => 'Reset link sent to your email'
    ]);
}
}
