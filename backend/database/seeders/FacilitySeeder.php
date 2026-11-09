<?php

namespace Database\Seeders;

use App\Models\Facility;
use App\Models\Room;
use Illuminate\Database\Seeder;

class FacilitySeeder extends Seeder
{
    /** Nama, ikon (lihat frontend/src/lib/facilityIcons), dan kamar yang memilikinya secara default. */
    private const LIST = [
        ['AC', 'snowflake', ['*']],
        ['Wi-Fi Cepat', 'wifi', ['*']],
        ['Kamar Mandi Privat', 'bath', ['*']],
        ['Air Panas', 'droplet', ['*']],
        ['TV Layar Datar', 'tv', ['*']],
        ['Minibar', 'glass', ['Kamar Deluxe', 'Suite Eksekutif', 'Villa Taman', 'Villa Air']],
        ['Sarapan', 'coffee', ['*']],
        ['Akses Kolam Renang', 'waves', ['Kamar Deluxe', 'Suite Eksekutif', 'Villa Taman', 'Villa Air', 'Kamar Keluarga']],
        ['Balkon / Teras', 'sun', ['Kamar Deluxe', 'Suite Eksekutif', 'Villa Taman', 'Villa Air']],
        ['Bathtub', 'bath', ['Suite Eksekutif', 'Villa Air']],
        ['Meja Kerja', 'desk', ['Kamar Deluxe', 'Suite Eksekutif']],
        ['Brankas', 'lock', ['Kamar Deluxe', 'Suite Eksekutif', 'Villa Taman', 'Villa Air']],
        ['Antar-jemput Bandara', 'car', []],
        ['Tempat Tidur Bayi', 'baby', []],
    ];

    public function run(): void
    {
        foreach (self::LIST as $i => [$name, $icon, $rooms]) {
            $facility = Facility::updateOrCreate(['name' => $name], ['icon' => $icon, 'sort_order' => $i + 1]);

            if (! $rooms) {
                continue;
            }

            $ids = $rooms === ['*']
                ? Room::pluck('id')
                : Room::whereIn('name', $rooms)->pluck('id');

            $facility->rooms()->syncWithoutDetaching($ids->all());
        }
    }
}
