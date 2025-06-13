<?php

namespace App\Services;

class TableParser
{
    public function parse($ocrText)
    {
        // Split text into lines
        $lines = array_filter(explode("\n", $ocrText), function($line) {
            return !empty(trim($line));
        });

        if (empty($lines)) {
            return [];
        }

        $table = [];
        
        foreach ($lines as $line) {
            // Try different delimiters
            $cells = $this->parseLine($line);
            
            if (!empty($cells)) {
                $table[] = $cells;
            }
        }

        // Normalize table (ensure all rows have same number of columns)
        $table = $this->normalizeTable($table);

        return $table;
    }

    private function parseLine($line)
    {
        $line = trim($line);
        
        // Try to detect delimiter
        $delimiters = [
            '\t' => "\t",  // Tab
            '\|' => '|',   // Pipe
            '  +' => '  ', // Multiple spaces
            ',' => ',',    // Comma
        ];

        $cells = [];
        
        foreach ($delimiters as $pattern => $delimiter) {
            if (preg_match("/$pattern/", $line)) {
                $cells = preg_split("/$pattern/", $line);
                $cells = array_map('trim', $cells);
                
                // If we got reasonable cells, use them
                if (count($cells) > 1 && !empty(array_filter($cells))) {
                    return $cells;
                }
            }
        }

        // If no delimiter found, treat as single cell
        return [$line];
    }

    private function normalizeTable($table)
    {
        if (empty($table)) {
            return $table;
        }

        // Find maximum number of columns
        $maxCols = 0;
        foreach ($table as $row) {
            $maxCols = max($maxCols, count($row));
        }

        // Pad rows to have same number of columns
        foreach ($table as &$row) {
            while (count($row) < $maxCols) {
                $row[] = '';
            }
        }

        return $table;
    }
}