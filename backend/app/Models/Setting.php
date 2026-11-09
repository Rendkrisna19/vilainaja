<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $primaryKey = 'key';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['key', 'value'];

    /** Nilai bawaan untuk setiap pengaturan yang dikenal. */
    public const DEFAULTS = [
        'site_name' => 'vilainaja',
        'tagline' => 'Beristirahat tanpa terburu-buru.',
        'description' => 'Villa dan kamar butik di tengah Ubud, Bali.',
        'email' => 'halo@vilainaja.id',
        'phone' => '+62 812-3456-7890',
        'whatsapp' => '6281234567890',
        'address' => 'Jl. Raya Ubud No. 18, Ubud, Gianyar, Bali 80571',
        'check_in_time' => '14:00',
        'check_out_time' => '12:00',
        'instagram' => '',
        'facebook' => '',
        'tiktok' => '',
    ];

    /** @return array<string, string> */
    public static function allValues(): array
    {
        $stored = static::query()->pluck('value', 'key')->all();

        return array_merge(self::DEFAULTS, array_map(fn ($v) => $v ?? '', $stored));
    }
}
