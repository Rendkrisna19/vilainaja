<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Room;
use App\Services\AvailabilityService;
use App\Services\BookingService;
use App\Support\Phone;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PublicController extends Controller
{
    /** Daftar kamar aktif beserta sisa unit pada rentang tanggal (default: malam ini). */
    public function rooms(Request $request, AvailabilityService $availability, BookingService $bookings): JsonResponse
    {
        $data = $request->validate([
            'check_in' => ['nullable', 'date_format:Y-m-d'],
            'check_out' => ['nullable', 'date_format:Y-m-d', 'after:check_in'],
            'guests' => ['nullable', 'integer', 'min:1', 'max:20'],
        ]);

        $in = $data['check_in'] ?? today()->toDateString();
        $out = $data['check_out'] ?? Carbon::parse($in)->addDay()->toDateString();
        $nights = max(1, (int) Carbon::parse($in)->diffInDays(Carbon::parse($out)));
        $guests = $data['guests'] ?? 1;

        $bookings->expireOverdue();

        $rooms = Room::where('is_active', true)->with(['images', 'facilities'])->orderBy('price')->get();
        $stats = $availability->forRooms($rooms, $in, $out);

        return response()->json([
            'data' => $rooms->map(fn (Room $r) => [
                'id' => $r->id,
                'slug' => $r->slug,
                'name' => $r->name,
                'tag' => $r->tag,
                'description' => $r->description,
                // Foto dari admin (WebP) diutamakan; URL Unsplash lama dipakai bila belum ada foto.
                'image_url' => $r->images->first()?->url() ?? $r->image_url,
                'thumb_url' => $r->images->first()?->thumbUrl() ?? $r->image_url,
                'images' => $r->images->map(fn ($i) => ['url' => $i->url(), 'thumb_url' => $i->thumbUrl(), 'width' => $i->width, 'height' => $i->height])->values(),
                'facilities' => $r->facilities->map(fn ($f) => ['id' => $f->id, 'name' => $f->name, 'icon' => $f->icon])->values(),
                'size' => $r->size,
                'capacity' => $r->capacity,
                'bed' => $r->bed,
                'price' => $r->price,
                'stock' => $r->stock,
                'booked_units' => $stats[$r->id]['booked'],
                'units_left' => $stats[$r->id]['left'],
                'is_available' => $stats[$r->id]['left'] > 0 && $r->capacity >= $guests,
                'total_price' => $r->price * $nights,
            ])->values(),
            'meta' => ['check_in' => $in, 'check_out' => $out, 'nights' => $nights, 'guests' => $guests, 'hold_minutes' => config('booking.hold_minutes'), 'server_time' => now()->toIso8601String()],
        ]);
    }

    /** Form "hubungi kami" di landing page → masuk ke menu Leads di admin. */
    public function storeLead(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:160'],
            'message' => ['required', 'string', 'min:5', 'max:1000'],
            'website' => ['nullable', 'max:0'], // honeypot: bot mengisi, manusia tidak
        ], [
            'website.max' => 'Permintaan tidak valid.',
        ], [
            'name' => 'nama', 'phone' => 'nomor WhatsApp', 'email' => 'email', 'message' => 'pesan',
        ]);

        $phone = Phone::normalize($data['phone']);
        if (! $phone) {
            throw ValidationException::withMessages(['phone' => 'Nomor WhatsApp tidak valid. Contoh: 0812 3456 7890.']);
        }

        Lead::create([
            'name' => trim($data['name']),
            'phone' => $phone,
            'email' => $data['email'] ?? null,
            'message' => trim($data['message']),
            'source' => 'website',
            'status' => 'new',
        ]);

        return response()->json(['message' => 'Terima kasih! Pesan Anda sudah kami terima dan akan segera kami balas.'], 201);
    }
}
