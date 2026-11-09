<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    public const STATUSES = ['new', 'contacted', 'qualified', 'closed'];

    public const SOURCES = ['website', 'whatsapp', 'instagram', 'referral', 'other'];

    protected $fillable = ['name', 'email', 'phone', 'source', 'status', 'message'];

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        return $query->when($term, fn ($q) => $q->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
                ->orWhere('email', 'like', "%{$term}%")
                ->orWhere('phone', 'like', "%{$term}%")
                ->orWhere('message', 'like', "%{$term}%");
        }));
    }
}
