<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Room */
class RoomResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'tag' => $this->tag,
            'description' => $this->description,
            'image_url' => $this->image_url,
            'size' => $this->size,
            'capacity' => $this->capacity,
            'bed' => $this->bed,
            'price' => $this->price,
            'stock' => $this->stock,
            'is_active' => $this->is_active,
            // Terisi malam ini: dihitung dari booking yang menahan unit (dikonfirmasi / check-in / menunggu bayar).
            'booked_units' => $this->when($this->getAttribute('booked_units') !== null, fn () => (int) $this->booked_units),
            'units_left' => $this->when($this->getAttribute('units_left') !== null, fn () => (int) $this->units_left),
            'availability' => $this->when(
                $this->getAttribute('units_left') !== null,
                fn () => ! $this->is_active ? 'inactive' : ($this->units_left < 1 ? 'full' : 'available'),
            ),
            'bookings_count' => $this->whenCounted('bookings'),
            'images' => $this->whenLoaded('images', fn () => $this->images->map(fn ($i) => [
                'id' => $i->id,
                'url' => $i->url(),
                'thumb_url' => $i->thumbUrl(),
                'width' => $i->width,
                'height' => $i->height,
            ])->values()),
            'facilities' => $this->whenLoaded('facilities', fn () => $this->facilities->map(fn ($f) => [
                'id' => $f->id,
                'name' => $f->name,
                'icon' => $f->icon,
            ])->values()),
            'facility_ids' => $this->whenLoaded('facilities', fn () => $this->facilities->pluck('id')->values()),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
