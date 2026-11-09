<?php

return [

    // Lama kamar "ditahan" untuk pelanggan yang belum membayar (menit). Juga dipakai sebagai masa berlaku Snap.
    'hold_minutes' => (int) env('BOOKING_HOLD_MINUTES', 30),

    // Batas booking menunggu pembayaran per pelanggan (mencegah menahan banyak kamar sekaligus).
    'max_pending_per_user' => (int) env('BOOKING_MAX_PENDING_PER_USER', 3),

    // Batas jumlah malam dalam satu booking.
    'max_nights' => (int) env('BOOKING_MAX_NIGHTS', 30),

    // URL frontend untuk halaman setelah pembayaran (callback Midtrans).
    'frontend_url' => rtrim((string) env('FRONTEND_URL', 'http://localhost:5173'), '/'),

];
