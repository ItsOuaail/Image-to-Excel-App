<?php
namespace App\Services;

use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ExcelService
{
    public function createExcel($tableData)
    {
        // Check if the table data is valid
        if (empty($tableData)) {
            Log::error("No data found to create Excel file.");
            return null;
        }

        Log::info("Creating Excel with table data: " . print_r($tableData, true));

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Populate the spreadsheet with table data
        $rowNum = 1;
        foreach ($tableData as $row) {
            $colNum = 1;
            foreach ($row as $cell) {
                // Clean the cell content completely
                $cleanCell = $this->cleanCellContent($cell);
                
                // Get cell reference
                $cellRef = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colNum) . $rowNum;
                
                // The simplest approach: prepend apostrophe to force text mode
                $textValue = "'" . $cleanCell;
                $sheet->setCellValue($cellRef, $textValue);
                
                $colNum++;
            }
            $rowNum++;
        }

        // Save the spreadsheet to storage
        $fileName = 'conversions/' . uniqid() . '.xlsx';
        $filePath = storage_path('app/public/' . $fileName);

        try {
            $writer = new Xlsx($spreadsheet);
            $writer->save($filePath);
            Log::info("Excel file saved successfully at: " . $filePath);
            return $fileName;
        } catch (\Exception $e) {
            Log::error("Error saving Excel file: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Clean cell content to be Excel-safe
     */
    private function cleanCellContent($content)
    {
        // Convert to string
        $content = (string) $content;
        
        // Remove line breaks and trim
        $content = trim(str_replace(["\r", "\n", "\t"], " ", $content));
        
        // If empty, return empty
        if (empty($content)) {
            return '';
        }
        
        // Remove any characters that might cause issues
        $content = preg_replace('/[^\x20-\x7E]/', '', $content); // Keep only printable ASCII
        
        return $content;
    }
}