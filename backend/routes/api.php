<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

// Authentication routes (if you have them)
Route::post('/login', [App\Http\Controllers\Api\AuthController::class, 'login']);
Route::post('/register', [App\Http\Controllers\Api\AuthController::class, 'register']);

// 🧪 DEBUG ROUTES (NO AUTH REQUIRED) - Move these OUTSIDE the middleware group
Route::get('/debug/test-excel', function () {
    Log::info("🧪 DEBUG: Testing Excel generation");
    
    // Sample table data
    $sampleData = [
        ['Name', 'Age', 'City'],
        ['John Doe', '25', 'New York'],
        ['Jane Smith', '30', 'Los Angeles'],
        ['Bob Johnson', '35', 'Chicago']
    ];
    
    $excelService = new \App\Services\ExcelService();
    $result = $excelService->createExcel($sampleData);
    
    if ($result) {
        $fullPath = storage_path('app/public/' . $result);
        $fileExists = file_exists($fullPath);
        $fileSize = $fileExists ? filesize($fullPath) : 0;
        
        return response()->json([
            'success' => true,
            'excel_path' => $result,
            'full_path' => $fullPath,
            'file_exists' => $fileExists,
            'file_size' => $fileSize,
            'download_url' => asset('storage/' . $result)
        ]);
    } else {
        return response()->json([
            'success' => false,
            'message' => 'Excel generation failed'
        ]);
    }
});

// Debug route to check conversion status (NO AUTH)
Route::get('/debug/conversion/{id}', function ($id) {
    $conversion = \App\Models\Conversion::find($id);
    
    if (!$conversion) {
        return response()->json(['error' => 'Conversion not found']);
    }
    
    $debugInfo = [
        'id' => $conversion->id,
        'status' => $conversion->status,
        'original_filename' => $conversion->original_filename,
        'image_path' => $conversion->image_path,
        'excel_path' => $conversion->excel_path,
        'error_message' => $conversion->error_message,
        'extracted_data_length' => strlen($conversion->extracted_data ?? ''),
        'extracted_data_preview' => substr($conversion->extracted_data ?? '', 0, 200) . '...',
        'created_at' => $conversion->created_at,
        'updated_at' => $conversion->updated_at,
    ];
    
    // Check if files exist
    if ($conversion->image_path) {
        $imagePath = storage_path('app/public/' . $conversion->image_path);
        $debugInfo['image_exists'] = file_exists($imagePath);
        $debugInfo['image_size'] = file_exists($imagePath) ? filesize($imagePath) : 0;
        $debugInfo['image_url'] = asset('storage/' . $conversion->image_path);
    }
    
    if ($conversion->excel_path) {
        $excelPath = storage_path('app/public/' . $conversion->excel_path);
        $debugInfo['excel_exists'] = file_exists($excelPath);
        $debugInfo['excel_size'] = file_exists($excelPath) ? filesize($excelPath) : 0;
        $debugInfo['excel_download_url'] = asset('storage/' . $conversion->excel_path);
    }
    
    return response()->json($debugInfo);
});

// Route to download Excel file directly (NO AUTH - for testing)
Route::get('/debug/download-excel/{id}', function ($id) {
    $conversion = \App\Models\Conversion::find($id);
    
    if (!$conversion || !$conversion->excel_path) {
        return response()->json(['error' => 'Excel file not found'], 404);
    }
    
    $filePath = storage_path('app/public/' . $conversion->excel_path);
    
    if (!file_exists($filePath)) {
        return response()->json(['error' => 'Excel file does not exist on disk'], 404);
    }
    
    return response()->download($filePath, ($conversion->original_filename ?? 'converted') . '.xlsx');
});

// PUBLIC DOWNLOAD ROUTE (NO AUTH REQUIRED)
Route::get('/conversions/{id}/download', [App\Http\Controllers\Api\ConversionController::class, 'download'])
    ->name('api.conversions.download.public');

// Protected routes (REQUIRE AUTH)
Route::middleware('auth:sanctum')->group(function () {
    // Conversion routes
    Route::get('/conversions', [App\Http\Controllers\Api\ConversionController::class, 'index']);
    Route::post('/conversions', [App\Http\Controllers\Api\ConversionController::class, 'store']);
    Route::get('/conversions/{id}', [App\Http\Controllers\Api\ConversionController::class, 'show']);
    // Note: Download route is now public (moved outside this group)
    Route::delete('/conversions/{id}', [App\Http\Controllers\Api\ConversionController::class, 'destroy']);
});