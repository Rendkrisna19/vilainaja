<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\BookingException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BookingRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\Room;
use App\Services\AvailabilityService;
use App\Services\BookingService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    public function __construct(
        private readonly AvailabilityService $availability,
        private readonly BookingService $bookings,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->bookings->expireOverdue();

        $perPage = min(max($request->integer('per_page', 10), 1), 100);

        $items = Booking::query()
            ->with(['room:id,name,image_url', 'payment'])
            ->search($request->query('search'))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->query('status')))
            ->latest('id')
            ->paginate($perPage);

        return BookingResource::collection($items);
    }

    public function store(BookingRequest $request): JsonResponse
    {
        $booking = DB::transaction(function () use ($request) {
            $data = $request->validated();
            $this->assertAvailable($data);

            return Booking::create($this->payload($data) + ['source' => 'admin']);
        });

        return (new BookingResource($booking->load(['room:id,name,image_url', 'payment'])))->response()->setStatusCode(201);
    }

    public function show(Booking $booking): BookingResource
    {
        return new BookingResource($booking->load(['room:id,name,image_url', 'payment']));
    }

    public function update(BookingRequest $request, Booking $booking): BookingResource
    {
        DB::transaction(function () use ($request, $booking) {
            $data = $request->validated();
            $this->assertAvailable($data, $booking);

            $payload = $this->payload($data);
            // Booking online yang dikonfirmasi/ditutup tidak lagi memiliki batas bayar.
            if ($payload['status'] !== 'pending') {
                $payload['expires_at'] = null;
            }

            $booking->update($payload);
        });

        return new BookingResource($booking->refresh()->load(['room:id,name,image_url', 'payment']));
    }

    public function destroy(Booking $booking): JsonResponse
    {
        $booking->delete();

        return response()->json(['message' => 'Booking dihapus.']);
    }

    /** Menolak booking yang membuat kamar melebihi jumlah unit (baris kamar dikunci selama pengecekan). */
    private function assertAvailable(array $data, ?Booking $current = null): void
    {
        if (! in_array($data['status'], ['pending', 'confirmed', 'checked_in'], true)) {
            return;
        }

        $room = Room::whereKey($data['room_id'])->lockForUpdate()->firstOrFail();
        $in = Carbon::parse($data['check_in'])->toDateString();
        $out = Carbon::parse($data['check_out'])->toDateString();

        if ($this->availability->unitsLeft($room, $in, $out, $current?->id) < 1) {
            throw new BookingException("Kamar \"{$room->name}\" sudah penuh pada tanggal tersebut (stok {$room->stock} unit).", 409, 'sold_out');
        }
    }

    /** Total harga dihitung otomatis (malam × harga kamar) bila tidak diisi. */
    private function payload(array $data): array
    {
        if (! isset($data['total_price'])) {
            $nights = Carbon::parse($data['check_in'])->diffInDays(Carbon::parse($data['check_out']));
            $data['total_price'] = (int) (Room::findOrFail($data['room_id'])->price * $nights);
        }

        return $data;
    }
}
