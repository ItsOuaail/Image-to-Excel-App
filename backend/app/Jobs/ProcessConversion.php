<?php

namespace App\Jobs;

use App\Models\Conversion;
use App\Services\ExcelService;
use App\Services\OcrService;
use App\Services\TableParser;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProcessConversion implements ShouldQueue
{
    use InteractsWithQueue, SerializesModels, Batchable;

    protected $conversionId; // Store only the ID of the conversion

    // Constructor to accept only the conversion ID
    public function __construct($conversionId)
    {
        $this->conversionId = $conversionId;
    }

    // Handle the job
public function handle()
{
    try {
        $conversion = Conversion::find($this->conversionId);

        if (!$conversion) {
            Log::error("Conversion with ID {$this->conversionId} not found.");
            return;
        }

        $ocrText = $conversion->extracted_data;

        // Log OCR output for debugging
        Log::info("OCR Text: " . print_r($ocrText, true)); // Log the extracted OCR text

        // Check if the extracted data is empty
        if (empty($ocrText)) {
            Log::error("No OCR text found for conversion ID {$this->conversionId}");
            return;  // Exit if no OCR text
        }

        // Process the OCR text and convert to table data
        $table = (new TableParser())->parse($ocrText);

        if (empty($table)) {
            Log::error("No table data found for conversion ID {$this->conversionId}");
            return;  // Exit if table parsing failed
        }

        // Generate the Excel file
        $excelService = new ExcelService();
        $excelPath = $excelService->createExcel($table);

        // Check if the Excel file was created successfully
        if (!$excelPath) {
            Log::error("Failed to create Excel file for conversion ID {$this->conversionId}");
            return;
        }

        // Update conversion record with the Excel file path
        $conversion->update([
            'excel_path' => $excelPath,
            'status' => 'completed'
        ]);

        Log::info("Conversion for ID {$this->conversionId} completed successfully.");

    } catch (\Exception $e) {
        Log::error("Error processing conversion for ID {$this->conversionId}: " . $e->getMessage());
    }
}


}
