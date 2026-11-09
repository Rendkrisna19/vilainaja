<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Booking */
class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'room_id' => $this->room_id,
            'room' => $this->whenLoaded('room', fn () => [
                'id' => $this->room->id,
                'name' => $this->room->name,
                'image_url' => $this->room->image_url,
            ]),
            'guest_name' => $this->guest_name,
            'guest_email' => $this->guest_email,
            'guest_phone' => $this->guest_phone,
            'check_in' => $this->check_in?->format('Y-m-d'),
            'check_out' => $this->check_out?->format('Y-m-d'),
            'nights' => $this->check_in && $this->check_out ? (int) $this->check_in->diffInDays($this->check_out) : 0,
            'guests' => $this->guests,
            'total_price' => $this->total_price,
            'status' => $this->status,
            'source' => $this->source,
            'expires_at' => $this->status === 'pending' ? $this->expires_at?->toIso8601String() : null,
            'cancel_reason' => $this->cancel_reason,
            'payment' => $this->whenLoaded('payment', fn () => $this->payment ? [
                'status' => $this->payment->status,
                'payment_type' => $this->payment->payment_type,
                'paid_at' => $this->payment->paid_at?->toIso8601String(),
            ] : null),
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
