<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RoomRequest;
use App\Http\Resources\RoomResource;
use App\Models\Room;
use App\Services\AvailabilityService;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

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
        $room = Room::create($request->validated());

        return (new RoomResource($room))->response()->setStatusCode(201);
    }

    public function show(Room $room): RoomResource
    {
        return new RoomResource($room->loadCount('bookings'));
    }

    public function update(RoomRequest $request, Room $room): RoomResource
    {
        $room->update($request->validated());

        return new RoomResource($room->loadCount('bookings'));
    }

    public function destroy(Room $room): JsonResponse
    {
        if ($room->bookings()->exists()) {
            return response()->json([
                'message' => 'Kamar tidak dapat dihapus karena sudah memiliki data booking. Nonaktifkan saja kamar ini.',
            ], 409);
        }

        $room->delete();

        return response()->json(['message' => 'Kamar dihapus.']);
    }
}
