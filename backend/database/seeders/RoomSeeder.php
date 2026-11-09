<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $img = fn (string $id) => "https://images.unsplash.com/photo-{$id}?auto=format&fit=crop&w=900&q=80";

        $rooms = [
            ['Kamar Standar', null, 'Ringkas, terang, dan tenang. Cocok untuk perjalanan singkat.', '1631049307264-da0ec9d70304', 24, 2, '1 Queen', 850000, 12],
            ['Kamar Deluxe', 'Terpopuler', 'Jendela lebar menghadap kota, dengan sudut kerja di dekat jendela.', '1568495248636-6432b97bd949', 32, 2, '1 King', 1250000, 10],
            ['Kamar Keluarga', null, 'Dua tempat tidur besar dan ruang gerak lega untuk anak-anak.', '1595576508898-0ad5c879a061', 42, 4, '2 Twin', 1650000, 8],
            ['Suite Eksekutif', null, 'Ruang tidur dan ruang duduk terpisah, bathtub, dan sarapan di kamar.', '1618773928121-c32242e63f39', 58, 2, '1 King', 2450000, 6],
            ['Villa Taman', null, 'Villa berdiri sendiri dengan teras dan taman tropis pribadi.', '1611892440504-42a792e24d32', 75, 3, '1 King', 3400000, 5],
            ['Villa Air', 'Paling eksklusif', 'Dek langsung ke air, pintu kaca melengkung, dan pemandangan terbuka.', '1602002418082-a4443e081dd1', 96, 4, '1 King + sofa', 4900000, 3],
        ];

        foreach ($rooms as [$name, $tag, $desc, $image, $size, $cap, $bed, $price, $stock]) {
            Room::updateOrCreate(
                ['name' => $name],
                [
                    'tag' => $tag,
                    'description' => $desc,
                    'image_url' => $img($image),
                    'size' => $size,
                    'capacity' => $cap,
                    'bed' => $bed,
                    'price' => $price,
                    'stock' => $stock,
                    'is_active' => true,
                ],
            );
        }
    }
}
