<?php

namespace App\Services;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ExcelService
{
    public function createExcel(array $data, $filename = null)
    {
        if (empty($data)) {
            throw new \Exception('No data to export');
        }

        $filename = $filename ?: 'table_' . uniqid() . '.xlsx';
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Fill data into the spreadsheet
        $rowNumber = 1;
        foreach ($data as $row) {
            $columnLetter = 'A';
            foreach ($row as $cell) {
                $sheet->setCellValue($columnLetter . $rowNumber, $cell);
                $columnLetter++;
            }
            $rowNumber++;
        }

        // Save the file to the public directory
        $filePath = 'conversions/excel/' . $filename;
        $writer = new Xlsx($spreadsheet);
        $writer->save(storage_path('app/public/' . $filePath));

        return $filePath;
    }
}
