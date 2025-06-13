<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ConversionController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Conversion routes
    Route::post('/conversions', [ConversionController::class, 'store']);
    Route::get('/conversions', [ConversionController::class, 'index']);
    Route::get('/conversions/{id}', [ConversionController::class, 'show']);
});