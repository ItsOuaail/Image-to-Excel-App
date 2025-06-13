<?php

use App\Http\Controllers\Api\ConversionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Test route
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

// Debug route to check if we can reach the routes
Route::post('/test-register', function (Request $request) {
    return response()->json([
        'message' => 'Route is working',
        'data' => $request->all()
    ]);
});

// Check if controller exists
Route::get('/check-controller', function () {
    return response()->json([
        'controller_exists' => class_exists(\App\Http\Controllers\Api\AuthController::class),
        'method_exists' => method_exists(\App\Http\Controllers\Api\AuthController::class, 'register')
    ]);
});

// Public routes
Route::post('/register', [\App\Http\Controllers\Api\AuthController::class, 'register']);
Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
   
    
    // Conversion routes
    Route::post('/conversions', [ConversionController::class, 'store']);
    Route::get('/conversions', [ConversionController::class, 'index']);
    Route::get('/conversions/{id}', [ConversionController::class, 'show']);
});