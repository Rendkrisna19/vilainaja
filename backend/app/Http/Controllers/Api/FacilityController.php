<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FacilityController extends Controller
{
    /** Daftar fasilitas master (dipakai form kamar sebagai centang). */
    public function index(): JsonResponse
    {
        return response()->json(['data' => Facility::orderBy('sort_order')->orderBy('name')->get(['id', 'name', 'icon'])]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80', Rule::unique('facilities', 'name')],
            'icon' => ['nullable', 'string', 'max:40'],
        ]);

        $facility = Facility::create($data + ['icon' => $data['icon'] ?? 'check', 'sort_order' => Facility::max('sort_order') + 1]);

        return response()->json(['data' => $facility->only(['id', 'name', 'icon'])], 201);
    }

    public function destroy(Facility $facility): JsonResponse
    {
        $facility->delete();

        return response()->json(['message' => 'Fasilitas dihapus.']);
    }
}
