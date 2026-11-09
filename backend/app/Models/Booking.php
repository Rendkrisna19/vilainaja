<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Booking extends Model
{
    public const STATUSES = ['pending', 'confirmed', 'checked_in', 'completed', 'cancelled'];

    /** Status yang dihitung sebagai pendapatan. */
    public const ACTIVE_STATUSES = ['confirmed', 'checked_in', 'completed'];

    /** Status yang menahan unit kamar (confirmed & checked_in; pending hanya selama belum kedaluwarsa). */
    public const OCCUPYING_STATUSES = ['confirmed', 'checked_in'];

    protected $fillable = [
        'code', 'room_id', 'user_id', 'guest_name', 'guest_email', 'guest_phone',
        'check_in', 'check_out', 'guests', 'total_price', 'status', 'source',
        'expires_at', 'idempotency_key', 'cancel_reason', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'check_in' => 'date:Y-m-d',
            'check_out' => 'date:Y-m-d',
            'guests' => 'integer',
            'total_price' => 'integer',
            'expires_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Booking $booking) {
            if (! $booking->code) {
                do {
                    $code = 'VIL-'.strtoupper(Str::random(6));
                } while (static::where('code', $code)->exists());
                $booking->code = $code;
            }
        });
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    /** Booking yang saat ini menahan satu unit kamar. */
    public function scopeHolding(Builder $query): Builder
    {
        return $query->where(function ($q) {
            $q->whereIn('status', self::OCCUPYING_STATUSES)
                ->orWhere(function ($q) {
                    $q->where('status', 'pending')
                        ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()));
                });
        });
    }

    /** Booking yang tanggalnya beririsan dengan [in, out). */
    public function scopeOverlapping(Builder $query, string $in, string $out): Builder
    {
        return $query->where('check_in', '<', $out)->where('check_out', '>', $in);
    }

    /** Pending online yang sudah lewat batas bayar. */
    public function scopeOverdue(Builder $query): Builder
    {
        return $query->where('status', 'pending')->whereNotNull('expires_at')->where('expires_at', '<=', now());
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        return $query->when($term, fn ($q) => $q->where(function ($q) use ($term) {
            $q->where('code', 'like', "%{$term}%")
                ->orWhere('guest_name', 'like', "%{$term}%")
                ->orWhere('guest_email', 'like', "%{$term}%")
                ->orWhere('guest_phone', 'like', "%{$term}%")
                ->orWhereHas('room', fn ($r) => $r->where('name', 'like', "%{$term}%"));
        }));
    }
}
