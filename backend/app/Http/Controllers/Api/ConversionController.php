<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversion;
use App\Jobs\ProcessConversion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ConversionController extends Controller
{
    public function index(Request $request)
    {
        // Get user's conversions with pagination
        $conversions = $request->user()
            ->conversions()
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($conversions);
    }

    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:10240' // 10MB max
        ]);

        // Store the image
        $image = $request->file('image');
        $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();
        $path = $image->storeAs('conversions/images', $filename, 'public');

        // Create conversion record
        $conversion = $request->user()->conversions()->create([
            'original_filename' => $image->getClientOriginalName(),
            'image_path' => $path,
            'status' => 'pending'
        ]);

        // Dispatch job to process the conversion
        ProcessConversion::dispatch($conversion);

        return response()->json([
            'id' => $conversion->id,
            'status' => $conversion->status,
            'message' => 'Image uploaded successfully. Processing will begin shortly.'
        ], 201);
    }

    public function show(Request $request, $id)
    {
        // Make sure user can only access their own conversions
        $conversion = $request->user()
            ->conversions()
            ->findOrFail($id);

        return response()->json([
            'id' => $conversion->id,
            'original_filename' => $conversion->original_filename,
            'status' => $conversion->status,
            'image_url' => $conversion->image_url,
            'excel_url' => $conversion->excel_url,
            'extracted_data' => $conversion->extracted_data,
            'error_message' => $conversion->error_message,
            'created_at' => $conversion->created_at,
            'updated_at' => $conversion->updated_at
        ]);
    }
}