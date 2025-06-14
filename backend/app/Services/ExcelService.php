<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class ExcelService
{
    public function createExcel($tableData)
    {
        Log::info("🚀 EXCEL SERVICE: Starting Excel creation");
        
        // Validate input data
        if (empty($tableData) || !is_array($tableData)) {
            Log::error("❌ Invalid table data provided to ExcelService");
            return null;
        }

        Log::info("📊 Excel Service received:");
        Log::info("   - Total rows: " . count($tableData));
        Log::info("   - First row columns: " . (isset($tableData[0]) ? count($tableData[0]) : 0));
        
        // Log sample data for debugging
        for ($i = 0; $i < min(3, count($tableData)); $i++) {
            Log::info("   - Row {$i}: " . json_encode($tableData[$i]));
        }

        try {
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Converted Table');

            // Populate the spreadsheet with table data
            $rowNum = 1;
            $maxColumns = 0;
            
            foreach ($tableData as $rowIndex => $row) {
                if (!is_array($row)) {
                    Log::warning("⚠️ Row {$rowIndex} is not an array, converting: " . print_r($row, true));
                    $row = [$row]; // Convert to array
                }
                
                $colNum = 1;
                $maxColumns = max($maxColumns, count($row));
                
                foreach ($row as $cellIndex => $cell) {
                    // Clean and prepare cell content
                    $cleanCell = $this->cleanCellContent($cell);
                    
                    // Get cell reference
                    $cellRef = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colNum) . $rowNum;
                    
                    // Set cell value
                    $sheet->setCellValue($cellRef, $cleanCell);
                    
                    Log::debug("📝 Set cell {$cellRef}: '{$cleanCell}'");
                    
                    $colNum++;
                }
                $rowNum++;
            }

            Log::info("✅ Populated spreadsheet:");
            Log::info("   - Rows: " . ($rowNum - 1));
            Log::info("   - Max columns: " . $maxColumns);

            // Style the header row if we have data
            if (count($tableData) > 0) {
                $this->styleHeaderRow($sheet, $maxColumns);
            }

            // Auto-size columns
            for ($col = 1; $col <= $maxColumns; $col++) {
                $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col);
                $sheet->getColumnDimension($columnLetter)->setAutoSize(true);
            }

            // Generate unique filename
            $fileName = 'conversions/excel_' . time() . '_' . uniqid() . '.xlsx';
            
            // Ensure directory exists
            $directory = storage_path('app/public/conversions');
            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
                Log::info("📁 Created directory: " . $directory);
            }
            
            $filePath = storage_path('app/public/' . $fileName);

            Log::info("💾 Saving Excel file to: " . $filePath);

            // Save the spreadsheet
            $writer = new Xlsx($spreadsheet);
            $writer->save($filePath);

            // Verify file was created and get its size
            if (file_exists($filePath)) {
                $fileSize = filesize($filePath);
                Log::info("✅ Excel file created successfully:");
                Log::info("   - Path: " . $fileName);
                Log::info("   - Full path: " . $filePath);
                Log::info("   - File size: " . $fileSize . " bytes");
                
                if ($fileSize > 0) {
                    return $fileName;
                } else {
                    Log::error("❌ Excel file was created but has 0 bytes");
                    return null;
                }
            } else {
                Log::error("❌ Excel file was not created at expected path");
                return null;
            }

        } catch (\Exception $e) {
            Log::error("❌ Excel creation failed: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());
            return null;
        }
    }

    /**
     * Style the header row to make it stand out
     */
    private function styleHeaderRow($sheet, $maxColumns)
    {
        try {
            $headerRange = 'A1:' . \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($maxColumns) . '1';
            
            $sheet->getStyle($headerRange)->applyFromArray([
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF']
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'color' => ['rgb' => '4472C4']
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => '000000']
                    ]
                ]
            ]);
            
            Log::info("🎨 Applied header styling to range: " . $headerRange);
        } catch (\Exception $e) {
            Log::warning("⚠️ Failed to apply header styling: " . $e->getMessage());
        }
    }

    /**
     * Clean cell content to be Excel-safe
     */
    private function cleanCellContent($content)
    {
        // Handle null or non-string values
        if ($content === null) {
            return '';
        }
        
        // Convert to string
        $content = (string) $content;
        
        // Remove line breaks and excessive whitespace
        $content = trim(preg_replace('/\s+/', ' ', $content));
        
        // If empty after cleaning, return empty
        if (empty($content)) {
            return '';
        }
        
        // Remove control characters but keep accented characters
        $content = preg_replace('/[\x00-\x1F\x7F]/', '', $content);
        
        // Handle special Excel characters that might cause issues
        $content = str_replace(['=', '+', '-', '@'], ['\'=', '\'+', '\'-', '\'@'], $content);
        
        // Limit length to prevent Excel issues
        if (strlen($content) > 32767) {
            $content = substr($content, 0, 32767);
            Log::warning("⚠️ Truncated cell content to 32767 characters");
        }
        
        return $content;
    }
}