<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json(['data' => Setting::allValues()]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'site_name' => ['required', 'string', 'max:80'],
            'tagline' => ['nullable', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:500'],
            'email' => ['nullable', 'email', 'max:160'],
            'phone' => ['nullable', 'string', 'max:30'],
            'whatsapp' => ['nullable', 'string', 'max:20', 'regex:/^[0-9]*$/'],
            'address' => ['nullable', 'string', 'max:300'],
            'check_in_time' => ['required', 'date_format:H:i'],
            'check_out_time' => ['required', 'date_format:H:i'],
            'instagram' => ['nullable', 'url', 'max:200'],
            'facebook' => ['nullable', 'url', 'max:200'],
            'tiktok' => ['nullable', 'url', 'max:200'],
        ], [
            'whatsapp.regex' => 'Nomor WhatsApp hanya boleh angka (contoh: 6281234567890).',
        ], [
            'site_name' => 'nama situs',
            'tagline' => 'tagline',
            'description' => 'deskripsi',
            'email' => 'email',
            'phone' => 'telepon',
            'whatsapp' => 'WhatsApp',
            'address' => 'alamat',
            'check_in_time' => 'jam check-in',
            'check_out_time' => 'jam check-out',
            'instagram' => 'Instagram',
            'facebook' => 'Facebook',
            'tiktok' => 'TikTok',
        ]);

        foreach ($data as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value ?? '']);
        }

        return response()->json(['data' => Setting::allValues()]);
    }
}
