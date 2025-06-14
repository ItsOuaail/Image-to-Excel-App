<?php

namespace App\Jobs;

use App\Models\Conversion;
use App\Services\ExcelService;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessConversion implements ShouldQueue
{
    use InteractsWithQueue, SerializesModels, Batchable;

    protected $conversionId;
    protected $tableData;
    protected $rawText;

    public function __construct($conversionId, $tableData, $rawText = null)
    {
        $this->conversionId = $conversionId;
        $this->tableData = $tableData;
        $this->rawText = $rawText;
    }

    public function handle()
    {
        Log::info("🚀 TABLE JOB STARTED: Processing conversion ID {$this->conversionId}");

        try {
            $conversion = Conversion::find($this->conversionId);

            if (!$conversion) {
                Log::error("❌ Conversion not found: {$this->conversionId}");
                return;
            }

            Log::info("📊 Job received data:");
            Log::info("   - Table rows: " . count($this->tableData));
            Log::info("   - Table columns: " . (count($this->tableData) > 0 ? count($this->tableData[0]) : 0));
            Log::info("   - Raw text length: " . strlen($this->rawText ?? ''));
            Log::info("   - DB extracted_data length: " . strlen($conversion->extracted_data ?? ''));

            // Use table data from job parameter (most reliable)
            if (empty($this->tableData)) {
                Log::error("❌ No table data provided to job");
                $conversion->update([
                    'status' => 'failed',
                    'error_message' => 'No table data to process'
                ]);
                return;
            }

            // Validate table data structure
            if (!is_array($this->tableData) || count($this->tableData) === 0) {
                Log::error("❌ Invalid table data structure");
                $conversion->update([
                    'status' => 'failed',
                    'error_message' => 'Invalid table data structure'
                ]);
                return;
            }

            Log::info("📊 Table data preview:");
            for ($i = 0; $i < min(3, count($this->tableData)); $i++) {
                Log::info("   Row {$i}: " . json_encode($this->tableData[$i]));
            }

            // Update status to processing
            $conversion->update(['status' => 'processing']);

            // Generate Excel directly from table data
            Log::info("📊 Generating Excel file from table data...");
            $excelService = new ExcelService();
            $excelPath = $excelService->createExcel($this->tableData);

            if (!$excelPath) {
                Log::error("❌ Excel generation failed");
                $conversion->update([
                    'status' => 'failed',
                    'error_message' => 'Failed to generate Excel file'
                ]);
                return;
            }

            // Verify the file was actually created
            $fullExcelPath = storage_path('app/public/' . $excelPath);
            if (!file_exists($fullExcelPath)) {
                Log::error("❌ Excel file was not created at: " . $fullExcelPath);
                $conversion->update([
                    'status' => 'failed',
                    'error_message' => 'Excel file was not created on disk'
                ]);
                return;
            }

            $fileSize = filesize($fullExcelPath);
            Log::info("✅ Excel file created successfully:");
            Log::info("   - Path: " . $excelPath);
            Log::info("   - Full path: " . $fullExcelPath);
            Log::info("   - File size: " . $fileSize . " bytes");

            // Success!
            $conversion->update([
                'excel_path' => $excelPath,
                'status' => 'completed'
            ]);

            Log::info("🎉 SUCCESS: Table conversion {$this->conversionId} completed");

        } catch (\Exception $e) {
            Log::error("💥 TABLE JOB FAILED: " . $e->getMessage());
            Log::error("💥 Stack trace: " . $e->getTraceAsString());
            
            if (isset($conversion)) {
                $conversion->update([
                    'status' => 'failed',
                    'error_message' => 'Processing error: ' . $e->getMessage()
                ]);
            }
        }
    }
}