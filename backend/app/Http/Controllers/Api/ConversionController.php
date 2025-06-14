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
        Log::info("   - Raw OCR text: " . $rawText);

        // Create conversion record WITH the extracted data
        $conversion = $request->user()->conversions()->create([
            'original_filename' => $image->getClientOriginalName(),
            'image_path' => $path,
            'status' => 'pending',
            'extracted_data' => $rawText
        ]);

        Log::info("📋 Conversion record created with ID: " . $conversion->id);
        Log::info("📝 Saved extracted_data length: " . strlen($rawText));

        // Dispatch job to generate Excel directly from table data
        Bus::dispatch(new ProcessConversion($conversion->id, $tableData, $rawText));

        Log::info("🚀 Job dispatched for conversion ID: " . $conversion->id);

        return response()->json([
            'id' => $conversion->id,
            'status' => $conversion->status,
            'table_preview' => array_slice($tableData, 0, 3),
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
     * Get conversion details and provide download information (JSON Response)
     */
    public function show(Request $request, $id)
    {
        Log::info("📥 Show conversion request for ID: {$id}");

        $conversion = $request->user()->conversions()->find($id);

        if (!$conversion) {
            Log::error("❌ Conversion not found: {$id}");
            return response()->json(['message' => 'Conversion not found'], 404);
        }

        // Check if conversion is still processing
        if ($conversion->status === 'pending' || $conversion->status === 'processing') {
            Log::info("⏳ Conversion still processing: {$id}");
            return response()->json([
                'success' => false,
                'message' => 'Conversion is still processing. Please try again in a few moments.',
                'status' => $conversion->status,
                'id' => $conversion->id,
                'progress' => 'Processing your table...'
            ], 202);
        }

        // Check if conversion failed
        if ($conversion->status === 'failed') {
            Log::error("❌ Conversion failed: {$id}");
            return response()->json([
                'success' => false,
                'message' => 'Conversion failed: ' . ($conversion->error_message ?? 'Unknown error'),
                'status' => $conversion->status,
                'id' => $conversion->id
            ], 422);
        }

        // Check if Excel file exists
        if (!$conversion->excel_path) {
            Log::error("❌ No Excel file available for conversion: {$id}");
            return response()->json([
                'success' => false,
                'message' => 'Excel file not yet available',
                'status' => $conversion->status,
                'id' => $conversion->id
            ], 404);
        }

        $filePath = storage_path('app/public/' . $conversion->excel_path);

        if (!file_exists($filePath)) {
            Log::error("❌ Excel file not found on disk: {$filePath}");
            return response()->json([
                'success' => false,
                'message' => 'Excel file not found on server',
                'status' => $conversion->status,
                'id' => $conversion->id
            ], 404);
        }

        // Generate download filename
        $originalName = $conversion->original_filename ?? 'converted_table';
        $downloadName = $this->generateDownloadFilename($originalName);
        $fileSize = filesize($filePath);

        Log::info("✅ File ready - preparing JSON response:");
        Log::info("   - Original: {$originalName}");
        Log::info("   - Download name: {$downloadName}");
        Log::info("   - File size: {$fileSize} bytes");

        // Return JSON response with download information
        return response()->json([
            'success' => true,
            'message' => 'Excel file generated successfully! Use the download URL to get your file.',
            'data' => [
                'id' => $conversion->id,
                'status' => $conversion->status,
                'original_filename' => $conversion->original_filename,
                'download_filename' => $downloadName,
                'file_size' => $fileSize,
                'file_size_formatted' => $this->formatFileSize($fileSize),
                'created_at' => $conversion->created_at,
                'updated_at' => $conversion->updated_at,
                // Direct download URLs
                'download_url' => url('storage/' . $conversion->excel_path),
                'api_download_url' => url('api/conversions/' . $id . '/download')
            ],
            'download_info' => [
                'file_ready' => true,
                'filename' => $downloadName,
                'instructions' => 'Use the download_url or api_download_url to download your Excel file.'
            ]
        ], 200, [
            // Headers to provide download information
            'X-File-Ready' => 'true',
            'X-Download-Filename' => $downloadName,
            'X-File-Size' => $fileSize,
            'X-Download-URL' => url('storage/' . $conversion->excel_path)
        ]);
    }

    /**
     * Force download Excel file (Binary Response)
     */
    public function download(Request $request, $id)
    {
        Log::info("📥 Force download request for conversion ID: {$id}");

        $conversion = $request->user()->conversions()->find($id);

        if (!$conversion) {
            Log::error("❌ Conversion not found: {$id}");
            return response()->json(['message' => 'Conversion not found'], 404);
        }

        // Check if conversion is still processing
        if ($conversion->status === 'pending' || $conversion->status === 'processing') {
            Log::info("⏳ Conversion still processing: {$id}");
            return response()->json([
                'message' => 'Conversion is still processing. Please try again in a few moments.',
                'status' => $conversion->status,
                'id' => $conversion->id
            ], 202);
        }

        // Check if conversion failed
        if ($conversion->status === 'failed') {
            Log::error("❌ Conversion failed: {$id}");
            return response()->json([
                'message' => 'Conversion failed: ' . ($conversion->error_message ?? 'Unknown error'),
                'status' => $conversion->status,
                'id' => $conversion->id
            ], 422);
        }

        // Check if Excel file exists
        if (!$conversion->excel_path) {
            Log::error("❌ No Excel file available for conversion: {$id}");
            return response()->json([
                'message' => 'Excel file not available',
                'status' => $conversion->status,
                'id' => $conversion->id
            ], 404);
        }

        $filePath = storage_path('app/public/' . $conversion->excel_path);

        if (!file_exists($filePath)) {
            Log::error("❌ Excel file not found on disk: {$filePath}");
            return response()->json([
                'message' => 'Excel file not found on server',
                'status' => $conversion->status,
                'id' => $conversion->id
            ], 404);
        }

        // Generate download filename
        $originalName = $conversion->original_filename ?? 'converted_table';
        $downloadName = $this->generateDownloadFilename($originalName);
        $fileSize = filesize($filePath);

        Log::info("✅ Force downloading file:");
        Log::info("   - Download name: {$downloadName}");
        Log::info("   - File size: {$fileSize} bytes");

        // Return file download with headers optimized for all devices
        return response()->download($filePath, $downloadName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $downloadName . '"',
            'Content-Length' => $fileSize,
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }

    /**
     * Format file size in human readable format
     */
    private function formatFileSize($fileSize)
    {
        if ($fileSize >= 1024 * 1024) {
            return round($fileSize / (1024 * 1024), 2) . ' MB';
        } elseif ($fileSize >= 1024) {
            return round($fileSize / 1024, 2) . ' KB';
        } else {
            return $fileSize . ' bytes';
        }
    }

    /**
     * Generate a clean download filename
     */
    private function generateDownloadFilename($originalName)
    {
        // Remove file extension from original name
        $nameWithoutExt = pathinfo($originalName, PATHINFO_FILENAME);
        
        // Clean the filename (remove special characters)
        $cleanName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $nameWithoutExt);
        
        // Ensure it's not empty
        if (empty($cleanName)) {
            $cleanName = 'converted_table';
        }
        
        // Add timestamp to make it unique
        $timestamp = date('Y-m-d_H-i-s');
        
        return $cleanName . '_' . $timestamp . '.xlsx';
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