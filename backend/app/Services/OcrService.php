<?php

namespace App\Services;

use thiagoalessio\TesseractOCR\TesseractOCR;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class OcrService
{
    public function extractText($imagePath)
    {
        // Get full path to image in storage (public disk)
        $fullPath = Storage::disk('public')->path($imagePath);

        // Log the path for debugging
        Log::info("OCR is processing the image at path: " . $fullPath);

        try {
            // Check if the file exists at the specified path
            if (!file_exists($fullPath)) {
                Log::error("OCR Error: Image not found at path: " . $fullPath);
                return [
                    'success' => false,
                    'error' => 'Image not found at the specified path.'
                ];
            }

            // Use Tesseract OCR with better settings for table detection
            $ocr = new TesseractOCR($fullPath);
            $ocr->executable('C:\Program Files\Tesseract-OCR\tesseract.exe');

            // Better OCR settings for tables
            $ocr->psm(6); // Uniform block of text
            $ocr->oem(3); // Default OCR Engine Mode
            
            // Language setting (you can add more languages if needed)
            $ocr->lang('eng');
            
            // Whitelist characters commonly found in tables
            $ocr->allowlist('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,;:!?()-[]{}/@#$%&*+=_\'"\\|');
            
            // Try to preserve layout for tables
            $ocr->config('preserve_interword_spaces', '1');
            
            // Run the OCR
            $text = $ocr->run();

            // Clean up the text
            $text = $this->cleanOcrText($text);

            // If OCR failed to extract meaningful text, return an error
            if (empty($text) || $this->isGibberish($text)) {
                Log::error("OCR Error: No meaningful text extracted from image.");
                
                // Try with different PSM modes as fallback
                $fallbackText = $this->tryFallbackOcr($fullPath);
                if ($fallbackText) {
                    $text = $fallbackText;
                } else {
                    return [
                        'success' => false,
                        'error' => 'OCR extraction failed or returned gibberish text.'
                    ];
                }
            }

            return [
                'success' => true,
                'text' => $text
            ];
        } catch (\Exception $e) {
            Log::error("OCR Error: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Clean OCR text to remove noise
     */
    private function cleanOcrText($text)
    {
        // Remove excessive whitespace
        $text = preg_replace('/\s+/', ' ', $text);
        
        // Remove lines with too many special characters (likely noise)
        $lines = explode("\n", $text);
        $cleanLines = [];
        
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            // Skip lines that are mostly special characters or very short
            if (strlen($line) < 3) continue;
            
            // Count alphanumeric characters vs special characters
            $alphanumeric = preg_match_all('/[a-zA-Z0-9]/', $line);
            $total = strlen($line);
            
            // Keep line if it has reasonable amount of alphanumeric content
            if ($alphanumeric / $total > 0.3) {
                $cleanLines[] = $line;
            }
        }
        
        return implode("\n", $cleanLines);
    }

    /**
     * Check if the text appears to be gibberish
     */
    private function isGibberish($text)
    {
        if (empty($text) || strlen($text) < 10) {
            return true;
        }
        
        // Count readable words vs total characters
        $words = preg_split('/\s+/', $text);
        $readableWords = 0;
        
        foreach ($words as $word) {
            // Consider a word readable if it has reasonable length and character distribution
            if (strlen($word) >= 2 && preg_match('/[a-zA-Z0-9]/', $word)) {
                $readableWords++;
            }
        }
        
        // If less than 20% of words seem readable, consider it gibberish
        return ($readableWords / count($words)) < 0.2;
    }

    /**
     * Try different OCR settings as fallback
     */
    private function tryFallbackOcr($fullPath)
    {
        $psmModes = [4, 7, 8, 13]; // Different page segmentation modes
        
        foreach ($psmModes as $psm) {
            try {
                Log::info("Trying fallback OCR with PSM mode: " . $psm);
                
                $ocr = new TesseractOCR($fullPath);
                $ocr->executable('C:\Program Files\Tesseract-OCR\tesseract.exe');
                $ocr->psm($psm);
                $ocr->lang('eng');
                
                $text = $ocr->run();
                $cleanText = $this->cleanOcrText($text);
                
                if (!empty($cleanText) && !$this->isGibberish($cleanText)) {
                    Log::info("Fallback OCR successful with PSM mode: " . $psm);
                    return $cleanText;
                }
            } catch (\Exception $e) {
                Log::warning("Fallback OCR failed with PSM {$psm}: " . $e->getMessage());
                continue;
            }
        }
        
        return null;
    }
}