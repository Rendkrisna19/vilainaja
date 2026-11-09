<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Room;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        if (Booking::exists()) {
            return;
        }

        $faker = fake('id_ID');
        $rooms = Room::all();
        $today = today();

        for ($i = 0; $i < 72; $i++) {
            $room = $rooms->random();
            // 6 booking pertama dipastikan sedang menginap hari ini agar dashboard punya okupansi.
            $stayingNow = $i < 6;
            $checkIn = $stayingNow
                ? $today->copy()->subDays($faker->numberBetween(0, 2))
                : $today->copy()->addDays($faker->numberBetween(-150, 40));
            $nights = $stayingNow ? $faker->numberBetween(3, 5) : $faker->numberBetween(1, 6);
            $checkOut = $checkIn->copy()->addDays($nights);

            if ($checkOut->lt($today)) {
                $status = $faker->boolean(88) ? 'completed' : 'cancelled';
            } elseif ($checkIn->lte($today)) {
                $status = 'checked_in';
            } else {
                $status = $faker->randomElement(['pending', 'pending', 'confirmed', 'confirmed', 'confirmed', 'cancelled']);
            }

            $name = $faker->name();

            Booking::create([
                'room_id' => $room->id,
                'guest_name' => $name,
                'guest_email' => $faker->boolean(80) ? strtolower(preg_replace('/[^a-z]/i', '', explode(' ', $name)[0])).$faker->numberBetween(1, 99).'@'.$faker->randomElement(['gmail.com', 'yahoo.com', 'outlook.com']) : null,
                'guest_phone' => $faker->numerify('0812########'),
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'guests' => $faker->numberBetween(1, $room->capacity),
                'total_price' => $room->price * $nights,
                'status' => $status,
                'notes' => $faker->boolean(25) ? $faker->randomElement([
                    'Minta lantai atas.',
                    'Datang sekitar pukul 20.00.',
                    'Merayakan ulang tahun pernikahan.',
                    'Butuh tempat tidur bayi.',
                    'Antar-jemput bandara.',
                ]) : null,
                // Dibuat sebelum check-in, tetapi tidak pernah di masa depan.
                'created_at' => min($checkIn->copy()->subDays($faker->numberBetween(2, 30)), now()->subHours($faker->numberBetween(1, 48))),
            ]);
        }
    }
}
