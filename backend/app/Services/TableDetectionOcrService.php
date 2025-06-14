<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class TableDetectionOcrService
{
    private $apiKey = 'K81862857888957';
    private $apiUrl = 'https://api.ocr.space/parse/image';

    public function extractTableFromImage($imagePath)
    {
        try {
            $fullPath = Storage::disk('public')->path($imagePath);
            
            Log::info("🔍 Table Detection OCR: Processing " . $fullPath);
            
            if (!file_exists($fullPath)) {
                return [
                    'success' => false,
                    'error' => 'Image not found'
                ];
            }

            // Use OCR.space with table-optimized settings
            $response = Http::timeout(90)
                ->attach('file', file_get_contents($fullPath), basename($imagePath))
                ->post($this->apiUrl, [
                    'apikey' => $this->apiKey,
                    'language' => 'eng',
                    'OCREngine' => '2',  // Engine 2 better for tables
                    'isTable' => 'true', // Enable table detection
                    'detectOrientation' => 'true',
                    'scale' => 'true'
                ]);

            if (!$response->successful()) {
                Log::error("Table Detection API Error: " . $response->body());
                return [
                    'success' => false,
                    'error' => 'API request failed'
                ];
            }

            $result = $response->json();
            
            if (isset($result['IsErroredOnProcessing']) && $result['IsErroredOnProcessing']) {
                return [
                    'success' => false,
                    'error' => 'OCR processing failed'
                ];
            }

            // Extract text from response
            $extractedText = '';
            if (isset($result['ParsedResults']) && !empty($result['ParsedResults'])) {
                foreach ($result['ParsedResults'] as $parseResult) {
                    $extractedText .= $parseResult['ParsedText'] ?? '';
                }
            }

            if (empty(trim($extractedText))) {
                return [
                    'success' => false,
                    'error' => 'No text extracted from table'
                ];
            }

            Log::info("📝 Raw OCR text extracted: " . $extractedText);

            // Parse the extracted text as a table
            $tableData = $this->parseTableStructure($extractedText);
            
            Log::info("📊 Table Detection Result: " . count($tableData) . " rows extracted");

            return [
                'success' => true,
                'table_data' => $tableData,
                'raw_text' => $extractedText
            ];

        } catch (\Exception $e) {
            Log::error("Table Detection Exception: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Parse OCR text specifically as table structure
     */
    private function parseTableStructure($text)
    {
        Log::info("🔍 Parsing table structure from OCR text");
        
        $lines = explode("\n", trim($text));
        $cleanLines = [];
        
        // Clean up lines - be more lenient
        foreach ($lines as $line) {
            $line = trim($line);
            if (!empty($line)) { // Keep any non-empty line
                $cleanLines[] = $line;
            }
        }
        
        if (empty($cleanLines)) {
            return [['No Data']];
        }
        
        Log::info("📋 Processing " . count($cleanLines) . " lines for table detection");
        Log::info("🔍 Lines content: " . json_encode($cleanLines));
        
        // Strategy 1: Try to detect table by analyzing spacing patterns
        $table = $this->detectTableBySpacing($cleanLines);
        
        if (!empty($table) && count($table) > 1) {
            Log::info("✅ Table detected by spacing analysis");
            return $table;
        }
        
        // Strategy 2: Try to detect table by line patterns
        $table = $this->detectTableByPattern($cleanLines);
        
        if (!empty($table) && count($table) > 1) {
            Log::info("✅ Table detected by pattern analysis");
            return $table;
        }
        
        // Strategy 3: Enhanced fallback - smarter distribution
        $table = $this->createEnhancedFallbackTable($cleanLines);
        
        Log::info("🔄 Using enhanced fallback table creation");
        return $table;
    }

    /**
     * Enhanced fallback table creation with better distribution
     */
    private function createEnhancedFallbackTable($lines)
    {
        $totalLines = count($lines);
        
        // Try to determine optimal number of columns based on content
        $avgWordCount = 0;
        $wordCounts = [];
        
        foreach ($lines as $line) {
            $wordCount = str_word_count($line);
            $wordCounts[] = $wordCount;
            $avgWordCount += $wordCount;
        }
        
        $avgWordCount = $avgWordCount / $totalLines;
        
        // Determine columns based on line analysis
        $numColumns = 2; // Default
        
        if ($avgWordCount <= 1.5) {
            $numColumns = max(2, min(4, ceil($totalLines / 3))); // More columns for short content
        } elseif ($avgWordCount > 3) {
            $numColumns = 2; // Fewer columns for longer content
        }
        
        Log::info("🧮 Enhanced fallback: {$totalLines} lines, avg {$avgWordCount} words/line, using {$numColumns} columns");
        
        $table = [];
        
        // Create headers
        $headers = [];
        for ($i = 1; $i <= $numColumns; $i++) {
            $headers[] = "Column {$i}";
        }
        $table[] = $headers;
        
        // Distribute lines into rows
        $currentRow = [];
        
        foreach ($lines as $line) {
            $currentRow[] = $line;
            
            if (count($currentRow) >= $numColumns) {
                $table[] = array_slice($currentRow, 0, $numColumns);
                $currentRow = array_slice($currentRow, $numColumns);
            }
        }
        
        // Add any remaining data as final row
        if (!empty($currentRow)) {
            while (count($currentRow) < $numColumns) {
                $currentRow[] = '';
            }
            $table[] = $currentRow;
        }
        
        return $table;
    }

    /**
     * Try to detect table by analyzing spacing between words
     */
    private function detectTableBySpacing($lines)
    {
        $spacedLines = [];
        $potentialSeparators = [
            '/\s{3,}/',    // 3+ spaces
            '/\s{2,}/',    // 2+ spaces
            '/\t+/',       // Tabs
            '/\|/',        // Pipe characters
        ];
        
        foreach ($potentialSeparators as $separator) {
            $spacedLines = [];
            
            foreach ($lines as $line) {
                $parts = preg_split($separator, $line);
                $parts = array_map('trim', $parts);
                $parts = array_filter($parts, function($part) {
                    return !empty($part);
                });
                
                if (count($parts) >= 2) {
                    $spacedLines[] = array_values($parts);
                }
            }
            
            // Check if this separator worked well
            if (count($spacedLines) >= 3) {
                $columnCounts = array_map('count', $spacedLines);
                $avgCols = round(array_sum($columnCounts) / count($columnCounts));
                
                $consistentLines = array_filter($columnCounts, function($count) use ($avgCols) {
                    return abs($count - $avgCols) <= 1;
                });
                
                if (count($consistentLines) >= count($spacedLines) * 0.6) {
                    Log::info("📊 Detected table with separator pattern, ~{$avgCols} columns");
                    return $this->normalizeTableColumns($spacedLines, $avgCols);
                }
            }
        }
        
        return [];
    }

    /**
     * Try to detect table by analyzing patterns in the text
     */
    private function detectTableByPattern($lines)
    {
        // Look for potential header patterns
        $firstLine = $lines[0] ?? '';
        $potentialHeaders = [];
        
        // Check if first line looks like headers
        if ($this->looksLikeTableHeader($firstLine)) {
            // Try to split first line into column headers
            $parts = preg_split('/\s{2,}/', $firstLine);
            $parts = array_map('trim', $parts);
            $parts = array_filter($parts);
            
            if (count($parts) >= 2) {
                $potentialHeaders = array_values($parts);
                $numColumns = count($potentialHeaders);
                
                // Distribute remaining lines
                $dataLines = array_slice($lines, 1);
                return $this->createTableFromHeadersAndData($potentialHeaders, $dataLines);
            }
        }
        
        return [];
    }

    /**
     * Check if a line looks like a table header
     */
    private function looksLikeTableHeader($line)
    {
        $line = strtolower(trim($line));
        
        // Common table headers
        $headerKeywords = [
            'name', 'nom', 'prenom', 'firstname', 'lastname', 'surname',
            'date', 'time', 'id', 'number', 'code', 'ref',
            'status', 'type', 'category', 'description', 'title',
            'amount', 'price', 'cost', 'total', 'quantity',
            'email', 'phone', 'address', 'city', 'country'
        ];
        
        foreach ($headerKeywords as $keyword) {
            if (strpos($line, $keyword) !== false) {
                return true;
            }
        }
        
        // Also consider short lines with reasonable word count as potential headers
        $wordCount = str_word_count($line);
        return $wordCount >= 2 && $wordCount <= 6 && strlen($line) <= 50;
    }

    /**
     * Create table from identified headers and data
     */
    private function createTableFromHeadersAndData($headers, $dataLines)
    {
        $table = [];
        $table[] = $headers; // Add header row
        
        $numColumns = count($headers);
        $currentRow = [];
        
        foreach ($dataLines as $line) {
            $currentRow[] = trim($line);
            
            if (count($currentRow) >= $numColumns) {
                $table[] = array_slice($currentRow, 0, $numColumns);
                $currentRow = array_slice($currentRow, $numColumns);
            }
        }
        
        // Add remaining partial row
        if (!empty($currentRow)) {
            while (count($currentRow) < $numColumns) {
                $currentRow[] = '';
            }
            $table[] = $currentRow;
        }
        
        return $table;
    }

    /**
     * Normalize table columns to consistent count
     */
    private function normalizeTableColumns($spacedLines, $targetCols)
    {
        $normalizedTable = [];
        
        foreach ($spacedLines as $row) {
            // Pad or trim to target column count
            while (count($row) < $targetCols) {
                $row[] = '';
            }
            if (count($row) > $targetCols) {
                $row = array_slice($row, 0, $targetCols);
            }
            $normalizedTable[] = $row;
        }
        
        return $normalizedTable;
    }
}