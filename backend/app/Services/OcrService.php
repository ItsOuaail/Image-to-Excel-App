<?php

namespace App\Services;

use thiagoalessio\TesseractOCR\TesseractOCR;
use Illuminate\Support\Facades\Storage;

class OcrService
{
    public function extractText($imagePath)
    {
        // Get full path to image
        $fullPath = Storage::disk('public')->path($imagePath);
        
        try {
            // Use Tesseract OCR
            $ocr = new TesseractOCR($fullPath);
            
            // Configure for better table detection
            $ocr->psm(6); // Uniform block of text
            $ocr->whitelist(range('a', 'z'), range('A', 'Z'), range(0, 9), ' -.,;:!?()[]{}/@#$%&*+=_\'"\\');
            
            $text = $ocr->run();
            
            return [
                'success' => true,
                'text' => $text
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}