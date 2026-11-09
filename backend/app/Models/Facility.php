<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Facility extends Model
{
    protected $fillable = ['name', 'icon', 'sort_order'];

    public function rooms(): BelongsToMany
    {
        return $this->belongsToMany(Room::class);
    }
}
