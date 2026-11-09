<?php

namespace App\Console\Commands;

use App\Services\BookingService;
use Illuminate\Console\Command;

class ExpirePendingBookings extends Command
{
    protected $signature = 'bookings:expire';

    protected $description = 'Batalkan booking online yang melewati batas waktu pembayaran dan lepaskan kamarnya';

    public function handle(BookingService $bookings): int
    {
        $count = $bookings->expireOverdue();
        $this->info("{$count} booking kedaluwarsa dibatalkan.");

        return self::SUCCESS;
    }
}
