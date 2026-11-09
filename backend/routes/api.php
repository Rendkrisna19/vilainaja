<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\Customer\AuthController as CustomerAuthController;
use App\Http\Controllers\Api\Customer\BookingController as CustomerBookingController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FacilityController;
use App\Http\Controllers\Api\RoomImageController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\MidtransWebhookController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\SettingController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['status' => 'ok']));

/* ---------------- Publik (tanpa login) ---------------- */
Route::prefix('public')->group(function () {
    Route::get('/rooms', [PublicController::class, 'rooms'])->middleware('throttle:120,1');
    Route::post('/leads', [PublicController::class, 'storeLead'])->middleware('throttle:5,1');
});

// Notifikasi pembayaran dari Midtrans (diverifikasi lewat signature, bukan token login).
Route::post('/payments/midtrans/notification', MidtransWebhookController::class)->middleware('throttle:120,1');

/* ---------------- Pelanggan ---------------- */
Route::prefix('customer')->group(function () {
    Route::post('/register', [CustomerAuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('/login', [CustomerAuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('/google', [CustomerAuthController::class, 'google'])->middleware('throttle:20,1');

    Route::middleware(['auth:sanctum', 'role:customer'])->group(function () {
        Route::get('/me', [CustomerAuthController::class, 'me']);
        Route::put('/me', [CustomerAuthController::class, 'update']);
        Route::post('/logout', [CustomerAuthController::class, 'logout']);

        Route::get('/bookings', [CustomerBookingController::class, 'index']);
        Route::post('/bookings', [CustomerBookingController::class, 'store'])->middleware('throttle:20,1');
        Route::get('/bookings/{code}', [CustomerBookingController::class, 'show']);
        Route::post('/bookings/{code}/pay', [CustomerBookingController::class, 'pay'])->middleware('throttle:20,1');
        Route::post('/bookings/{code}/cancel', [CustomerBookingController::class, 'cancel'])->middleware('throttle:20,1');
    });
});

/* ---------------- Admin ---------------- */
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard', DashboardController::class);

    Route::apiResource('rooms', RoomController::class);
    Route::post('/rooms/{room}/images', [RoomImageController::class, 'store']);
    Route::delete('/room-images/{image}', [RoomImageController::class, 'destroy']);

    Route::get('/facilities', [FacilityController::class, 'index']);
    Route::post('/facilities', [FacilityController::class, 'store']);
    Route::delete('/facilities/{facility}', [FacilityController::class, 'destroy']);

    Route::apiResource('bookings', BookingController::class);
    Route::apiResource('leads', LeadController::class);

    Route::get('/settings', [SettingController::class, 'show']);
    Route::put('/settings', [SettingController::class, 'update']);
});
