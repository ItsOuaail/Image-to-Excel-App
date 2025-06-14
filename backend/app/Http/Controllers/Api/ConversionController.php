<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversion;
use App\Jobs\ProcessConversion;
use App\Services\OcrService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Bus;

class ConversionController extends Controller
{public function store(Request $request)
{
    $request->validate([
        'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:10240' // 10MB max
    ]);

    // Store the image
    $image = $request->file('image');
    $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();
    $path = $image->storeAs('conversions/images', $filename, 'public');

    // Perform OCR on the uploaded image
    $ocrService = new OcrService();
    $ocrResult = $ocrService->extractText($path);  // Use the stored path, not temporary path

    // Ensure OCR data is valid
    if (!$ocrResult['success']) {
        return response()->json(['message' => 'OCR error: ' . $ocrResult['error']], 400);
    }

    // Save the extracted OCR text
    $ocrText = $ocrResult['text'];

    // Create conversion record
    $conversion = $request->user()->conversions()->create([
        'original_filename' => $image->getClientOriginalName(),
        'image_path' => $path,
        'status' => 'pending',
        'extracted_data' => $ocrText  // Save extracted OCR text to the database
    ]);

    // Dispatch job to process the conversion with conversion ID instead of the full model
    Bus::dispatch(new ProcessConversion($conversion->id)); // Pass only the ID

    return response()->json([
        'id' => $conversion->id,
        'status' => $conversion->status,
        'message' => 'Image uploaded successfully. Processing will begin shortly.'
    ], 201);
}


   public function show(Request $request, $id)
{
    // Make sure the conversion exists and belongs to the authenticated user
    $conversion = $request->user()->conversions()->find($id);

    if (!$conversion) {
        return response()->json(['message' => 'Conversion not found'], 404);
    }

    return response()->json([
        'id' => $conversion->id,
        'original_filename' => $conversion->original_filename,
        'status' => $conversion->status,
        'image_url' => $conversion->image_url,
        'excel_url' => $conversion->excel_url,
        'extracted_data' => $conversion->extracted_data,
        'error_message' => $conversion->error_message,
        'created_at' => $conversion->created_at,
        'updated_at' => $conversion->updated_at
    ]);
}


}
