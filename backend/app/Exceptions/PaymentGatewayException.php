<?php

namespace App\Exceptions;

use RuntimeException;

/** Kegagalan layanan pembayaran (Midtrans). Pesannya aman ditampilkan ke pengguna. */
class PaymentGatewayException extends RuntimeException
{
    public function __construct(string $message, public readonly int $status = 502)
    {
        parent::__construct($message);
    }
}
