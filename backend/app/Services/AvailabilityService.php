<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Room;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

/**
 * Menghitung sisa unit kamar. Sisa unit pada rentang [check_in, check_out) adalah
 * stok dikurangi jumlah booking TERBANYAK yang menginap bersamaan pada satu malam mana pun di rentang itu.
 */
class AvailabilityService
{
    /**
     * @param  Collection<int, Room>|array<int, Room>  $rooms
     * @return array<int, array{booked:int,left:int}>  dikunci oleh room id
     */
    public function forRooms(Collection|array $rooms, string $in, string $out, ?int $excludeBookingId = null): array
    {
        $rooms = collect($rooms);

        $bookings = Booking::query()
            ->whereIn('room_id', $rooms->pluck('id'))
            ->holding()
            ->overlapping($in, $out)
            ->when($excludeBookingId, fn ($q) => $q->where('id', '!=', $excludeBookingId))
            ->get(['room_id', 'check_in', 'check_out'])
            ->groupBy('room_id');

        $result = [];
        foreach ($rooms as $room) {
            $booked = $this->peakOccupancy($bookings->get($room->id, collect()), $in, $out);
            $result[$room->id] = [
                'booked' => $booked,
                'left' => max(0, $room->stock - $booked),
            ];
        }

        return $result;
    }

    public function unitsLeft(Room $room, string $in, string $out, ?int $excludeBookingId = null): int
    {
        return $this->forRooms([$room], $in, $out, $excludeBookingId)[$room->id]['left'];
    }

    /** Jumlah booking terbanyak yang menginap bersamaan pada satu malam di rentang [in, out). */
    private function peakOccupancy(Collection $bookings, string $in, string $out): int
    {
        if ($bookings->isEmpty()) {
            return 0;
        }

        $peak = 0;
        for ($night = CarbonImmutable::parse($in); $night->toDateString() < $out; $night = $night->addDay()) {
            $d = $night->toDateString();
            $count = $bookings->filter(
                fn ($b) => $b->check_in->toDateString() <= $d && $b->check_out->toDateString() > $d
            )->count();
            $peak = max($peak, $count);
        }

        return $peak;
    }
}
