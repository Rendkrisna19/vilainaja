<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\BookingException;
use App\Http\Controllers\Controller;
use App\Http\Resources\RoomResource;
use App\Models\Room;
use App\Models\RoomImage;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoomImageController extends Controller
{
    private const MAX_PER_ROOM = 12;

    public function store(Request $request, Room $room, ImageService $images): JsonResponse
    {
        $request->validate([
            'images' => ['required', 'array', 'min:1', 'max:6'],
            'images.*' => ['required', 'file', 'image', 'mimes:jpeg,jpg,png,webp', 'max:10240'],
        ], [
            'images.max' => 'Maksimal 6 foto per unggahan.',
            'images.*.max' => 'Ukuran tiap foto maksimal 10 MB.',
            'images.*.mimes' => 'Format foto harus JPG, PNG, atau WebP.',
        ]);

        $existing = $room->images()->count();
        $incoming = count($request->file('images'));
        if ($existing + $incoming > self::MAX_PER_ROOM) {
            throw new BookingException('Satu kamar maksimal '.self::MAX_PER_ROOM.' foto. Hapus foto lama dulu.', 422);
        }

        $nextOrder = (int) $room->images()->max('sort_order') + 1;

        foreach ($request->file('images') as $file) {
            $data = $images->storeRoomImage($file, $room->id);
            $room->images()->create($data + ['sort_order' => $nextOrder++]);
        }

        return response()->json(new RoomResource($room->fresh()->load(['images', 'facilities'])), 201);
    }

    public function destroy(RoomImage $image, ImageService $images): JsonResponse
    {
        $images->deleteFiles($image->path, $image->thumb_path);
        $room = $image->room;
        $image->delete();

        return response()->json(new RoomResource($room->fresh()->load(['images', 'facilities'])));
    }
}
