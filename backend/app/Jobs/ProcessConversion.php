<?php

namespace App\Jobs;

use App\Models\Conversion;
use App\Services\ExcelService;
use App\Services\OcrService;
use App\Services\TableParser;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class ProcessConversion implements ShouldQueue
{
    use InteractsWithQueue, SerializesModels, Batchable;

    protected $conversion;

    public function __construct(Conversion $conversion)
    {
        $this->conversion = $conversion;
    }

    public function handle()
{
    // Assume $this->conversion contains the conversion object
    $ocrText = $this->conversion->extracted_data;
    $table = (new TableParser())->parse($ocrText);

    // Use the ExcelService to create an Excel file
    $excelService = new ExcelService();
    $excelPath = $excelService->createExcel($table);

    // Update the conversion record with the Excel file path
    $this->conversion->update([
        'excel_path' => $excelPath,
        'status' => 'completed'
    ]);
}

}
