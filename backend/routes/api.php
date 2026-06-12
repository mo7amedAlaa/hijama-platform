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
use App\Http\Controllers\Api\WorkScheduleController;
use App\Http\Controllers\Api\ScheduleController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public
Route::get('/sessions',      [TherapySessionController::class, 'index']);
Route::get('/slots',         [SlotController::class, 'index']);
Route::post('/slots/batch',  [SlotController::class, 'batch']);
Route::get('/stats',   [UserController::class, 'stats']);
Route::prefix('auth')->group(function () {

    Route::post('/register', RegisterController::class);

    Route::post('/login', LoginController::class);

    Route::post('/forgot-password', ForgotPasswordController::class);

    Route::post('/reset-password', ResetPasswordController::class);

    Route::get('/google/redirect', [GoogleController::class,'redirect']);

    Route::get('/google/callback', [GoogleController::class,'callback']);
});

// Protected
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', LogoutController::class);
    Route::get('/me',      [UserController::class, 'me']);
    Route::put('/me',      [UserController::class, 'update']);
    Route::get('/me/next-session', [therapySessionController::class, 'nextSession']);
    Route::get('/my-bookings',          [BookingController::class, 'myBookings']);
    Route::apiResource('/bookings',      BookingController::class);
    Route::post('/consultations', [ConsultationController::class, 'store']);
    Route::get('/consultations', [ConsultationController::class, 'index']);
    Route::put('/consultations/{id}', [ConsultationController::class, 'reply']);
    Route::delete('/consultations/{id}', [ConsultationController::class, 'destroy']);
    Route::get('/consultations/my', [ConsultationController::class, 'myConsultations']);
     // ============================================================
    // Admin-only routes
    // ============================================================
    Route::middleware('can:admin')->group(function () {
        Route::get('/all-sessions',            [TherapySessionController::class, 'all']);
        Route::post('/sessions',           [TherapySessionController::class, 'store']);
        Route::put('/sessions/{therapySession}',    [TherapySessionController::class, 'update']);
        Route::delete('/sessions/{therapySession}', [TherapySessionController::class, 'destroy']);
        Route::get ('/admin/work-schedule',       [ScheduleController::class, 'getWorkSchedule']);
        Route::put ('/admin/work-schedule',       [ScheduleController::class, 'updateWorkSchedule']);
        Route::get ('admin/slots/stats',         [ScheduleController::class, 'slotsStats']);
        Route::get ('/admin/blocked-slots',       [ScheduleController::class, 'getBlockedSlots']);
        Route::post('/admin/blocked-slots',       [ScheduleController::class, 'blockSlot']);
        Route::delete('/admin/blocked-slots/{blockedSlot}', [ScheduleController::class, 'unblockSlot']);
        Route::get('/users',        [UserController::class, 'index']);
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::delete('/users/{user}', [UserController::class, 'deleteUser']);
        Route::get('/admin/bookings/{booking}', [BookingController::class, 'show']);

        Route::patch('/work-schedules/{id}/toggle', [WorkScheduleController::class, 'toggle']);


    });
});
