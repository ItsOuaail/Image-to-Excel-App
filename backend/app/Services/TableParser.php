<?php

namespace App\Services;

use App\Models\ConversionTemplate;
use Illuminate\Support\Facades\Log;

class TableParser
{
    public function parse($ocrText, $templateId = null)
    {
        Log::info("🎯 CLEAN TableParser Starting");
        Log::info("📝 Template ID received: " . ($templateId ?? 'NULL'));
        
        // Clean OCR text into lines
        $lines = $this->extractLines($ocrText);
        Log::info("📋 Extracted " . count($lines) . " lines: " . json_encode($lines));
        
        if (empty($lines)) {
            Log::error("❌ No lines extracted from OCR");
            return [['No Data']];
        }
        
        // Load template if provided
        if ($templateId) {
            $template = ConversionTemplate::find($templateId);
            
            if ($template) {
                Log::info("✅ Template found: " . $template->name);
                Log::info("📊 Template columns: " . json_encode($template->getColumnNames()));
                return $this->createTableWithTemplate($lines, $template);
            } else {
                Log::error("❌ Template ID {$templateId} not found in database");
            }
        }
        
        // Fallback: No template
        Log::info("🔄 No template - creating simple table");
        return $this->createSimpleTable($lines);
    }
    
    /**
     * Extract clean lines from OCR text
     */
    private function extractLines($ocrText)
    {
        $lines = explode("\n", trim($ocrText));
        $cleanLines = [];
        
        foreach ($lines as $line) {
            $cleaned = trim($line);
            if (!empty($cleaned) && strlen($cleaned) > 0) {
                $cleanLines[] = $cleaned;
            }
        }
        
        return $cleanLines;
    }
    
    /**
     * Create table using template structure
     */
    private function createTableWithTemplate($lines, $template)
    {
        $columnNames = $template->getColumnNames();
        $numColumns = count($columnNames);
        
        Log::info("🏗️ Building table with {$numColumns} columns");
        
        $table = [];
        
        // 1. Add header row (from template)
        $table[] = $columnNames;
        Log::info("📋 Header row: " . json_encode($columnNames));
        
        // 2. Distribute data lines into columns
        $currentRow = [];
        $rowCount = 0;
        
        foreach ($lines as $index => $line) {
            $currentRow[] = $line;
            
            // When we have enough data for a complete row
            if (count($currentRow) >= $numColumns) {
                $dataRow = array_slice($currentRow, 0, $numColumns);
                $table[] = $dataRow;
                $rowCount++;
                
                Log::info("📝 Row {$rowCount}: " . json_encode($dataRow));
                
                // Keep remaining data for next row
                $currentRow = array_slice($currentRow, $numColumns);
            }
        }
        
        // 3. Add any remaining partial row
        if (!empty($currentRow)) {
            // Pad with empty cells to match column count
            while (count($currentRow) < $numColumns) {
                $currentRow[] = '';
            }
            $table[] = $currentRow;
            $rowCount++;
            Log::info("📝 Final row {$rowCount}: " . json_encode($currentRow));
        }
        
        Log::info("✅ Table created: " . ($rowCount + 1) . " total rows (including header)");
        return $table;
    }
    
    /**
     * Create simple single-column table
     */
    private function createSimpleTable($lines)
    {
        Log::info("🔧 Creating simple single-column table");
        
        $table = [];
        $table[] = ['Data']; // Simple header
        
        foreach ($lines as $line) {
            $table[] = [$line];
        }
        
        return $table;
    }
}