<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\ForgotPasswordController;
use App\Http\Controllers\Api\Auth\ResetPasswordController;
use App\Http\Controllers\Api\Auth\GoogleController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\TherapySessionController;
use App\Http\Controllers\Api\SlotController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ConsultationController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/sessions', [TherapySessionController::class, 'index']);

Route::get('/slots',    [SlotController::class, 'index']);

Route::prefix('auth')->group(function () {

    Route::post('/register', RegisterController::class);

    Route::post('/login', LoginController::class);

    Route::post('/forgot-password', ForgotPasswordController::class);

    Route::post('/reset-password', ResetPasswordController::class);

    Route::get('/google/redirect', [GoogleController::class,'redirect']);

    Route::get('/google/callback', [GoogleController::class,'callback']);
});

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', LogoutController::class);
    Route::get('/me',      [UserController::class, 'me']);
    Route::put('/me',      [UserController::class, 'update']);
 Route::get('/me/next-session', [therapySessionController::class, 'nextSession']);
    // Bookings
    Route::get('/my-bookings',          [BookingController::class, 'myBookings']);
    Route::apiResource('/bookings',      BookingController::class);
    Route::post('/consultations', [ConsultationController::class, 'store']);
Route::get('/consultations', [ConsultationController::class, 'index']);

    // ============================================================
    // Admin-only routes
    // ============================================================
    Route::middleware('can:admin')->group(function () {

        // إدارة الجلسات
        Route::get('/all-sessions',            [TherapySessionController::class, 'all']);
        Route::post('/sessions',           [TherapySessionController::class, 'store']);
        Route::put('/sessions/{therapySession}',    [TherapySessionController::class, 'update']);
        Route::delete('/sessions/{therapySession}', [TherapySessionController::class, 'destroy']);

        // إدارة المواعيد
        Route::post('/slots',       [SlotController::class, 'store']);
        Route::post('/slots/bulk',  [SlotController::class, 'bulk']);

        // إدارة المستخدمين
        Route::get('/users',        [UserController::class, 'index']);
        Route::get('/users/{user}', [UserController::class, 'show']);
    });
});
