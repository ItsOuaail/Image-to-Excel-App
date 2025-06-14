<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class OcrService
{
    private $apiKey = 'K81862857888957';
    private $apiUrl = 'https://api.ocr.space/parse/image';

    public function extractText($imagePath)
    {
        try {
            $fullPath = Storage::disk('public')->path($imagePath);
            
            Log::info("🔍 OCR Debug: Processing image at: " . $fullPath);
            
            if (!file_exists($fullPath)) {
                Log::error("❌ OCR Error: Image not found at path: " . $fullPath);
                return [
                    'success' => false,
                    'error' => 'Image not found at the specified path.'
                ];
            }

            // Check file size
            $fileSize = filesize($fullPath);
            Log::info("🔍 OCR Debug: File size: " . $fileSize . " bytes");
            
            if ($fileSize > 5 * 1024 * 1024) { // 5MB limit for OCR.space
                Log::warning("⚠️ OCR Warning: File size exceeds 5MB limit");
            }

            // Try multiple OCR engines and settings
            $results = [];
            
            // Engine 1 (default)
            $result1 = $this->tryOcrRequest($fullPath, basename($imagePath), ['OCREngine' => '1']);
            if ($result1['success']) {
                $results[] = ['engine' => 1, 'data' => $result1];
            }
            
            // Engine 2 (often better for tables)
            $result2 = $this->tryOcrRequest($fullPath, basename($imagePath), ['OCREngine' => '2']);
            if ($result2['success']) {
                $results[] = ['engine' => 2, 'data' => $result2];
            }

            // Choose the best result (longest text usually means better OCR)
            if (empty($results)) {
                return [
                    'success' => false,
                    'error' => 'All OCR engines failed to extract text'
                ];
            }

            $bestResult = $this->chooseBestResult($results);
            Log::info("✅ OCR Success: Using engine " . $bestResult['engine'] . " result");
            
            return $bestResult['data'];

        } catch (\Exception $e) {
            Log::error("❌ OCR Exception: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    private function tryOcrRequest($fullPath, $filename, $extraParams = [])
    {
        try {
            Log::info("🔄 Trying OCR with params: " . json_encode($extraParams));

            $params = array_merge([
                'apikey' => $this->apiKey,
                'language' => 'eng',
                'isOverlayRequired' => 'false',
                'detectOrientation' => 'true',
                'scale' => 'true'
            ], $extraParams);

            $response = Http::timeout(90) // Increased timeout
                ->attach('file', file_get_contents($fullPath), $filename)
                ->post($this->apiUrl, $params);

            Log::info("🔍 OCR API response status: " . $response->status());

            if (!$response->successful()) {
                Log::error("❌ OCR API Error: " . $response->body());
                return [
                    'success' => false,
                    'error' => 'API request failed: ' . $response->status()
                ];
            }

            $result = $response->json();
            Log::info("🔍 OCR Raw Response: " . json_encode($result, JSON_PRETTY_PRINT));
            
            // Check for processing errors
            if (isset($result['IsErroredOnProcessing']) && $result['IsErroredOnProcessing']) {
                $errorMessages = $result['ErrorMessage'] ?? ['Unknown error'];
                if (is_array($errorMessages)) {
                    $errorMessage = implode(', ', $errorMessages);
                } else {
                    $errorMessage = $errorMessages;
                }
                Log::error("❌ OCR Processing Error: " . $errorMessage);
                return [
                    'success' => false,
                    'error' => 'OCR processing error: ' . $errorMessage
                ];
            }

            // Extract text from all parsed results
            $extractedText = '';
            if (isset($result['ParsedResults']) && !empty($result['ParsedResults'])) {
                foreach ($result['ParsedResults'] as $parseResult) {
                    $parsedText = $parseResult['ParsedText'] ?? '';
                    $extractedText .= $parsedText;
                    
                    Log::info("🔍 ParsedText: " . $parsedText);
                    
                    // Log additional details
                    if (isset($parseResult['FileParseExitCode'])) {
                        Log::info("🔍 FileParseExitCode: " . $parseResult['FileParseExitCode']);
                    }
                    if (isset($parseResult['ErrorMessage']) && !empty($parseResult['ErrorMessage'])) {
                        Log::warning("⚠️ Parse Warning: " . $parseResult['ErrorMessage']);
                    }
                }
            }

            if (empty(trim($extractedText))) {
                Log::warning("⚠️ OCR Warning: No text extracted");
                return [
                    'success' => false,
                    'error' => 'No text could be extracted from the image'
                ];
            }

            $cleanText = $this->cleanOcrText($extractedText);
            
            Log::info("✅ OCR Extracted clean text (" . strlen($cleanText) . " chars): " . $cleanText);

            return [
                'success' => true,
                'text' => $cleanText,
                'raw_response' => $result
            ];

        } catch (\Exception $e) {
            Log::error("❌ OCR Request Exception: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    private function chooseBestResult($results)
    {
        // Choose result with most text content
        $bestResult = $results[0];
        $maxLength = strlen($bestResult['data']['text']);

        foreach ($results as $result) {
            $textLength = strlen($result['data']['text']);
            if ($textLength > $maxLength) {
                $maxLength = $textLength;
                $bestResult = $result;
            }
        }

        Log::info("🎯 Best result: Engine " . $bestResult['engine'] . " with " . $maxLength . " characters");
        return $bestResult;
    }

    private function cleanOcrText($text)
    {
        // More aggressive cleaning
        $text = preg_replace('/\r\n|\r/', "\n", $text);
        $text = preg_replace('/\n\s*\n/', "\n", $text);
        $text = trim($text);
        
        $lines = explode("\n", $text);
        $cleanLines = [];
        
        foreach ($lines as $line) {
            $line = trim($line);
            // Keep lines with at least 1 character (less restrictive)
            if (strlen($line) >= 1) {
                $cleanLines[] = $line;
            }
        }
        
        return implode("\n", $cleanLines);
    }
}