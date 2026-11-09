<?php

namespace App\Support;

class Phone
{
    /**
     * Normalisasi nomor Indonesia ke format internasional tanpa "+": 0812-3456-7890 → 6281234567890.
     * Mengembalikan null bila bukan nomor seluler Indonesia yang valid.
     */
    public static function normalize(?string $input): ?string
    {
        $digits = preg_replace('/\D+/', '', (string) $input);

        if ($digits === '' || $digits === null) {
            return null;
        }

        if (str_starts_with($digits, '0')) {
            $digits = '62'.substr($digits, 1);
        } elseif (str_starts_with($digits, '8')) {
            $digits = '62'.$digits;
        }

        return preg_match('/^628[0-9]{7,12}$/', $digits) ? $digits : null;
    }
}
