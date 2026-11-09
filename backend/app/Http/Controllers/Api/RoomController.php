<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RoomRequest;
use App\Http\Resources\RoomResource;
use App\Models\Room;
use App\Services\AvailabilityService;
use App\Services\BookingService;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class RoomController extends Controller
{
    public function __construct(
        private readonly AvailabilityService $availability,
        private readonly BookingService $bookings,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->bookings->expireOverdue();

        $perPage = min(max($request->integer('per_page', 10), 1), 100);

        $rooms = Room::query()
            ->with(['images', 'facilities'])
            ->withCount('bookings')
            ->search($request->query('search'))
            ->when($request->filled('active'), fn ($q) => $q->where('is_active', $request->boolean('active')))
            ->orderBy($request->query('sort') === 'price' ? 'price' : 'id', $request->query('dir') === 'desc' ? 'desc' : 'asc')
            ->paginate($perPage);

        // Ketersediaan malam ini → badge "Tersedia / Penuh" di admin.
        $stats = $this->availability->forRooms($rooms->getCollection(), today()->toDateString(), today()->addDay()->toDateString());
        $rooms->getCollection()->each(function (Room $room) use ($stats) {
            $room->setAttribute('booked_units', $stats[$room->id]['booked']);
            $room->setAttribute('units_left', $stats[$room->id]['left']);
        });

        return RoomResource::collection($rooms);
    }

    public function store(RoomRequest $request): JsonResponse
    {
        $room = DB::transaction(function () use ($request) {
            $room = Room::create($request->safe()->except('facility_ids'));
            $room->facilities()->sync($request->input('facility_ids', []));
            return $room;
        });

        return (new RoomResource($room->load(['images', 'facilities'])))->response()->setStatusCode(201);
    }

    public function show(Room $room): RoomResource
    {
        return new RoomResource($room->loadCount('bookings')->load(['images', 'facilities']));
    }

    public function update(RoomRequest $request, Room $room): RoomResource
    {
        DB::transaction(function () use ($request, $room) {
            $room->update($request->safe()->except('facility_ids'));
            $room->facilities()->sync($request->input('facility_ids', []));
        });

        return new RoomResource($room->loadCount('bookings')->load(['images', 'facilities']));
    }

    public function destroy(Room $room, ImageService $images): JsonResponse
    {
        if ($room->bookings()->exists()) {
            return response()->json([
                'message' => 'Kamar tidak dapat dihapus karena sudah memiliki data booking. Nonaktifkan saja kamar ini.',
            ], 409);
        }

        foreach ($room->images as $img) {
            $images->deleteFiles($img->path, $img->thumb_path);
        }

        $room->delete();

        return response()->json(['message' => 'Kamar dihapus.']);
    }
}
