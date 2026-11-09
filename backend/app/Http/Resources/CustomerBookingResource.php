<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Booking */
class CustomerBookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $pending = $this->status === 'pending' && $this->expires_at;
        $secondsLeft = $pending ? max(0, (int) now()->diffInSeconds($this->expires_at, false)) : null;
        $paid = $this->payment?->status === 'paid';

        return [
            'code' => $this->code,
            'status' => $this->status,
            'room' => $this->whenLoaded('room', fn () => [
                'id' => $this->room->id,
                'name' => $this->room->name,
                'slug' => $this->room->slug,
                'image_url' => $this->room->images()->first()?->thumbUrl() ?? $this->room->image_url,
            ]),
            'check_in' => $this->check_in?->format('Y-m-d'),
            'check_out' => $this->check_out?->format('Y-m-d'),
            'nights' => (int) $this->check_in->diffInDays($this->check_out),
            'guests' => $this->guests,
            'total_price' => $this->total_price,
            'notes' => $this->notes,
            'cancel_reason' => $this->cancel_reason,
            'expires_at' => $pending ? $this->expires_at->toIso8601String() : null,
            'seconds_left' => $secondsLeft,
            'can_pay' => $pending && $secondsLeft > 0 && ! $paid,
            'payment' => $this->whenLoaded('payment', fn () => [
                'status' => $this->payment->status,
                'payment_type' => $this->payment->payment_type,
                'paid_at' => $this->payment->paid_at?->toIso8601String(),
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
