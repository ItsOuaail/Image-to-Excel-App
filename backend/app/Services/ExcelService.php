<?php
namespace App\Services;

use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Cell\DataType;

class ExcelService
{
    public function createExcel($tableData)
    {
        // Check if the table data is valid
        if (empty($tableData)) {
            Log::error("No data found to create Excel file.");
            return null;
        }

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Log the table data for debugging
        Log::info("Table data structure: " . print_r($tableData, true));

        // Populate the spreadsheet with table data
        foreach ($tableData as $rowIndex => $row) {
            foreach ($row as $colIndex => $cell) {
                // Sanitize the cell content to avoid formula errors
                $sanitizedCell = $this->sanitizeCellContent($cell);

                // Get the column letter for the current column
                $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex + 1);
                $cellCoordinate = $columnLetter . ($rowIndex + 1);

                // Log problematic cells for debugging
                if ($rowIndex == 14) { // A15 row (0-indexed)
                    Log::info("Setting cell {$cellCoordinate} with value: '{$sanitizedCell}'");
                }

                try {
                    // First try to set as explicit string
                    $sheet->setCellValueExplicit($cellCoordinate, $sanitizedCell, DataType::TYPE_STRING);
                } catch (\Exception $e) {
                    Log::warning("Failed to set cell {$cellCoordinate} as string, trying alternative method: " . $e->getMessage());
                    // Fallback: use getCell and setValueExplicit separately
                    $cellObj = $sheet->getCell($cellCoordinate);
                    $cellObj->setValueExplicit($sanitizedCell, DataType::TYPE_STRING);
                }
            }
        }

        // Save the spreadsheet to storage
        $fileName = 'conversions/' . uniqid() . '.xlsx';
        $writer = new Xlsx($spreadsheet);
        $filePath = storage_path('app/public/' . $fileName);

        try {
            $writer->save($filePath);
            Log::info("Excel file saved successfully at: " . $filePath);
        } catch (\Exception $e) {
            Log::error("Error saving Excel file: " . $e->getMessage());
            return null;
        }

        return $fileName; // Return relative path for storage
    }

    /**
     * Sanitize cell content to avoid formula errors
     * 
     * @param string $content
     * @return string
     */
    private function sanitizeCellContent($content)
    {
        // Convert to string if not already
        if (!is_string($content)) {
            $content = (string) $content;
        }

        // Trim whitespace
        $content = trim($content);

        // If empty, return empty string
        if (empty($content)) {
            return '';
        }

        // More aggressive sanitization for Excel formula prevention
        // Replace any equals signs that could be interpreted as formulas
        $content = str_replace('=', '= ', $content);
        
        // Remove or replace other problematic characters
        $content = str_replace(['"', "'", '`'], '', $content);
        
        // Replace any remaining formula indicators with text equivalents
        $content = preg_replace('/^[\+\-@]/', ' $0', $content);
        
        // Ensure content doesn't start with problematic characters
        if (preg_match('/^[=+\-@]/', $content)) {
            $content = 'TEXT: ' . $content;
        }
        
        return $content;
    }
}