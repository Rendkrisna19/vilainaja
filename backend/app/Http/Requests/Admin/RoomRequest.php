<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'tag' => ['nullable', 'string', 'max:60'],
            'description' => ['nullable', 'string', 'max:2000'],
            'image_url' => ['nullable', 'url', 'max:500'],
            'size' => ['required', 'integer', 'min:0', 'max:1000'],
            'capacity' => ['required', 'integer', 'min:1', 'max:20'],
            'bed' => ['nullable', 'string', 'max:60'],
            'price' => ['required', 'integer', 'min:0'],
            'stock' => ['required', 'integer', 'min:0', 'max:1000'],
            'is_active' => ['required', 'boolean'],
            'facility_ids' => ['nullable', 'array'],
            'facility_ids.*' => ['integer', 'exists:facilities,id'],
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nama kamar',
            'tag' => 'label',
            'description' => 'deskripsi',
            'image_url' => 'URL gambar',
            'size' => 'luas',
            'capacity' => 'kapasitas',
            'bed' => 'tempat tidur',
            'price' => 'harga',
            'stock' => 'jumlah unit',
            'is_active' => 'status',
        ];
    }
}
