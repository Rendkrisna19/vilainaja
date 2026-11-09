<?php

namespace Database\Seeders;

use App\Models\Lead;
use Illuminate\Database\Seeder;

class LeadSeeder extends Seeder
{
    public function run(): void
    {
        if (Lead::exists()) {
            return;
        }

        $faker = fake('id_ID');

        $messages = [
            'Apakah masih ada Villa Air untuk akhir pekan depan?',
            'Berapa biaya antar-jemput dari Bandara Ngurah Rai?',
            'Kami rombongan 8 orang, apakah ada diskon?',
            'Apakah kolam renang bisa dipakai anak-anak?',
            'Mohon info paket honeymoon.',
            'Apakah bisa check-in lebih awal sekitar pukul 11.00?',
            'Ada fasilitas sarapan untuk vegetarian?',
            'Saya ingin booking untuk 5 malam bulan depan.',
        ];

        for ($i = 0; $i < 28; $i++) {
            $name = $faker->name();

            Lead::create([
                'name' => $name,
                'email' => $faker->boolean(70) ? strtolower(preg_replace('/[^a-z]/i', '', explode(' ', $name)[0])).$faker->numberBetween(1, 99).'@gmail.com' : null,
                'phone' => $faker->boolean(85) ? $faker->numerify('0813########') : null,
                'source' => $faker->randomElement(['website', 'website', 'whatsapp', 'whatsapp', 'instagram', 'referral', 'other']),
                'status' => $faker->randomElement(['new', 'new', 'new', 'contacted', 'contacted', 'qualified', 'closed']),
                'message' => $faker->randomElement($messages),
                'created_at' => now()->subDays($faker->numberBetween(0, 60))->subMinutes($faker->numberBetween(0, 1400)),
            ]);
        }
    }
}
