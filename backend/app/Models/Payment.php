<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    public const PENDING = 'pending';
    public const PAID = 'paid';
    public const FAILED = 'failed';
    public const CANCELLED = 'cancelled';
    public const EXPIRED = 'expired';
    public const REFUND_NEEDED = 'refund_needed';

    protected $fillable = [
        'booking_id', 'order_id', 'gross_amount', 'status', 'snap_token', 'redirect_url',
        'payment_type', 'transaction_id', 'fraud_status', 'raw', 'paid_at', 'last_synced_at',
    ];

    protected $hidden = ['raw'];

    protected function casts(): array
    {
        return [
            'gross_amount' => 'integer',
            'raw' => 'array',
            'paid_at' => 'datetime',
            'last_synced_at' => 'datetime',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
