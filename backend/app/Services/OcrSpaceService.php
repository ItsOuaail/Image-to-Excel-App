<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class OcrSpaceService
{
    private $apiKey;
    private $apiUrl = 'https://api.ocr.space/parse/image';

    public function __construct()
    {
        // Use your actual OCR.space API key
        $this->apiKey = env('OCR_SPACE_API_KEY', 'K81862857888957');
    }

    public function extractText($imagePath)
    {
        try {
            // Get full path to image
            $fullPath = Storage::disk('public')->path($imagePath);
            
            if (!file_exists($fullPath)) {
                Log::error("OCR.space Error: Image not found at path: " . $fullPath);
                return [
                    'success' => false,
                    'error' => 'Image not found at the specified path.'
                ];
            }

            // Prepare the file for upload
            $response = Http::timeout(60)
                ->attach('file', file_get_contents($fullPath), basename($imagePath))
                ->post($this->apiUrl, [
                    'apikey' => $this->apiKey,
                    'language' => 'eng',
                    'isOverlayRequired' => false,
                    'detectOrientation' => true,
                    'isTable' => true, // Enable table detection
                    'OCREngine' => 2,  // Engine 2 is often better for tables
                    'scale' => true,   // Auto-scale
                    'isCreateSearchablePdf' => false
                ]);

            if (!$response->successful()) {
                Log::error("OCR.space API Error: " . $response->body());
                return [
                    'success' => false,
                    'error' => 'API request failed: ' . $response->status()
                ];
            }

            $result = $response->json();
            
            // Check for errors
            if (isset($result['IsErroredOnProcessing']) && $result['IsErroredOnProcessing']) {
                $errorMessage = $result['ErrorMessage'] ?? 'Unknown error';
                Log::error("OCR.space Processing Error: " . $errorMessage);
                return [
                    'success' => false,
                    'error' => 'OCR processing error: ' . $errorMessage
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
                    'error' => 'No text could be extracted from the image'
                ];
            }

            // Clean up the text
            $cleanText = $this->cleanOcrText($extractedText);

            return [
                'success' => true,
                'text' => $cleanText
            ];

        } catch (\Exception $e) {
            Log::error("OCR.space Exception: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Clean OCR text output
     */
    private function cleanOcrText($text)
    {
        // Remove excessive whitespace
        $text = preg_replace('/\s+/', ' ', $text);
        
        // Fix common OCR errors
        $text = str_replace(['\r\n', '\r', '\n\n\n'], "\n", $text);
        
        // Remove very short lines that are likely noise
        $lines = explode("\n", $text);
        $cleanLines = [];
        
        foreach ($lines as $line) {
            $line = trim($line);
            if (strlen($line) > 1) { // Keep lines with more than 1 character
                $cleanLines[] = $line;
            }
        }
        
        return implode("\n", $cleanLines);
    }
}