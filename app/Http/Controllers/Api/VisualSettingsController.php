<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\VisualPreferences;
use Illuminate\Http\Request;

class VisualSettingsController extends Controller
{
    public function show(Request $request)
    {
        return response()->json([
            'data' => VisualPreferences::normalize($request->user()->visual_preferences),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate(VisualPreferences::rules());

        $settings = VisualPreferences::normalize(array_merge(
            VisualPreferences::normalize($request->user()->visual_preferences),
            $validated,
        ));

        $request->user()->forceFill([
            'visual_preferences' => $settings,
        ])->save();

        return response()->json([
            'data' => $settings,
        ]);
    }
}
