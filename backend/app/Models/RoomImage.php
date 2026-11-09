<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoomImage extends Model
{
    protected $fillable = ['room_id', 'path', 'thumb_path', 'width', 'height', 'bytes', 'sort_order'];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function url(): string
    {
        return asset($this->path);
    }

    public function thumbUrl(): string
    {
        return asset($this->thumb_path);
    }
}
