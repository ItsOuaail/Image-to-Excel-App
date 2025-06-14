<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessConversion;
use App\Models\Conversion;
use App\Services\TableDetectionOcrService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Log;

class ConversionController extends Controller
{
    /**
     * Convert table image directly to Excel
     */
    public function store(Request $request)
    {
        Log::info("🚀 TABLE CONVERSION: New request received");
        
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:10240'
        ]);

        // Store the image
        $image = $request->file('image');
        $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();
        $path = $image->storeAs('conversions/images', $filename, 'public');

        Log::info("📁 Image stored at: " . $path);

        // Use table detection OCR service
        $tableOcrService = new TableDetectionOcrService();
        $ocrResult = $tableOcrService->extractTableFromImage($path);

        if (!$ocrResult['success']) {
            Log::error("❌ Table OCR failed: " . $ocrResult['error']);
            return response()->json(['message' => 'Table extraction failed: ' . $ocrResult['error']], 400);
        }

        $tableData = $ocrResult['table_data'];
        $rawText = $ocrResult['raw_text'];

        Log::info("✅ Table extracted successfully:");
        Log::info("   - Rows: " . count($tableData));
        Log::info("   - Columns: " . (count($tableData) > 0 ? count($tableData[0]) : 0));
        Log::info("   - Raw OCR text: " . $rawText); // Added for debugging

        // Create conversion record WITH the extracted data
        $conversion = $request->user()->conversions()->create([
            'original_filename' => $image->getClientOriginalName(),
            'image_path' => $path,
            'status' => 'pending',
            'extracted_data' => $rawText // FIX: Actually save the OCR text
        ]);

        Log::info("📋 Conversion record created with ID: " . $conversion->id);
        Log::info("📝 Saved extracted_data length: " . strlen($rawText));

        // Dispatch job to generate Excel directly from table data
        Bus::dispatch(new ProcessConversion($conversion->id, $tableData, $rawText));

        Log::info("🚀 Job dispatched for conversion ID: " . $conversion->id);

        return response()->json([
            'id' => $conversion->id,
            'status' => $conversion->status,
            'table_preview' => array_slice($tableData, 0, 3), // Show first 3 rows
            'total_rows' => count($tableData),
            'total_columns' => count($tableData) > 0 ? count($tableData[0]) : 0,
            'message' => 'Table extracted successfully. Excel generation in progress.',
            'debug_info' => [
                'ocr_text_length' => strlen($rawText),
                'ocr_preview' => substr($rawText, 0, 100) . '...'
            ]
        ], 201);
    }

    /**
     * Get conversion details
     */
    public function show(Request $request, $id)
    {
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
            'error_message' => $conversion->error_message,
            'created_at' => $conversion->created_at,
            'updated_at' => $conversion->updated_at,
            'debug_info' => [
                'extracted_data_length' => strlen($conversion->extracted_data ?? ''),
                'has_excel_path' => !empty($conversion->excel_path)
            ]
        ]);
    }

    /**
     * Get all conversions for the authenticated user
     */
    public function index(Request $request)
    {
        $conversions = $request->user()->conversions()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'conversions' => $conversions
        ]);
    }

    /**
     * Delete a conversion
     */
    public function destroy(Request $request, $id)
    {
        $conversion = $request->user()->conversions()->find($id);

        if (!$conversion) {
            return response()->json(['message' => 'Conversion not found'], 404);
        }

        // Delete associated files
        if ($conversion->image_path && Storage::disk('public')->exists($conversion->image_path)) {
            Storage::disk('public')->delete($conversion->image_path);
        }

        if ($conversion->excel_path && Storage::disk('public')->exists($conversion->excel_path)) {
            Storage::disk('public')->delete($conversion->excel_path);
        }

        $conversion->delete();

        return response()->json([
            'message' => 'Conversion deleted successfully'
        ]);
    }
}