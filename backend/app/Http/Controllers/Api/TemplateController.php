<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConversionTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TemplateController extends Controller
{
    public function index(Request $request)
    {
        $templates = $request->user()->conversionTemplates()->get();
        
        return response()->json([
            'templates' => $templates
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'columns' => 'required|array|min:1|max:10',
            'columns.*.name' => 'required|string|max:100',
            'columns.*.type' => 'required|in:text,number,date,boolean',
            'description' => 'nullable|string|max:500',
            'is_default' => 'boolean'
        ]);

        if ($request->is_default) {
            $request->user()->conversionTemplates()->update(['is_default' => false]);
        }

        $template = $request->user()->conversionTemplates()->create([
            'name' => $request->name,
            'columns' => $request->columns,
            'description' => $request->description,
            'is_default' => $request->is_default ?? false
        ]);

        return response()->json([
            'template' => $template,
            'message' => 'Template created successfully'
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $template = $request->user()->conversionTemplates()->findOrFail($id);
        
        return response()->json([
            'template' => $template
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $template = $request->user()->conversionTemplates()->findOrFail($id);
        $template->delete();

        return response()->json([
            'message' => 'Template deleted successfully'
        ]);
    }

    public function getDefault(Request $request)
    {
        $template = $request->user()->conversionTemplates()->where('is_default', true)->first();
        
        if (!$template) {
            $template = $request->user()->conversionTemplates()->create([
                'name' => 'Basic Template',
                'columns' => [
                    ['name' => 'Name', 'type' => 'text'],
                    ['name' => 'Value', 'type' => 'text']
                ],
                'description' => 'Default two-column template',
                'is_default' => true
            ]);
        }

        return response()->json([
            'template' => $template
        ]);
    }
}