<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Room extends Model
{
    protected $fillable = [
        'name', 'slug', 'tag', 'description', 'image_url',
        'size', 'capacity', 'bed', 'price', 'stock', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'size' => 'integer',
            'capacity' => 'integer',
            'price' => 'integer',
            'stock' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Room $room) {
            if (! $room->slug || $room->isDirty('name') && ! $room->isDirty('slug')) {
                $room->slug = static::uniqueSlug($room->name, $room->id);
            }
        });
    }

    public static function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'kamar';
        $slug = $base;
        $i = 2;

        while (static::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        return $query->when($term, fn ($q) => $q->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
                ->orWhere('tag', 'like', "%{$term}%")
                ->orWhere('bed', 'like', "%{$term}%");
        }));
    }
}
