<?php

namespace App\Exceptions;

use RuntimeException;

/** Pelanggaran aturan booking (kamar penuh, tanggal tidak valid, dsb). Pesannya aman ditampilkan ke pengguna. */
class BookingException extends RuntimeException
{
    public function __construct(string $message, public readonly int $status = 422, public readonly ?string $reason = null)
    {
        parent::__construct($message);
    }
}
