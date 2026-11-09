<?php

namespace App\Http\Requests\Admin;

use App\Models\Booking;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'room_id' => ['required', 'integer', 'exists:rooms,id'],
            'guest_name' => ['required', 'string', 'max:120'],
            'guest_email' => ['nullable', 'email', 'max:160'],
            'guest_phone' => ['required', 'string', 'max:30'],
            'check_in' => ['required', 'date'],
            'check_out' => ['required', 'date', 'after:check_in'],
            'guests' => ['required', 'integer', 'min:1', 'max:20'],
            'total_price' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', Rule::in(Booking::STATUSES)],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function attributes(): array
    {
        return [
            'room_id' => 'kamar',
            'guest_name' => 'nama tamu',
            'guest_email' => 'email',
            'guest_phone' => 'nomor telepon',
            'check_in' => 'tanggal check-in',
            'check_out' => 'tanggal check-out',
            'guests' => 'jumlah tamu',
            'total_price' => 'total harga',
            'status' => 'status',
            'notes' => 'catatan',
        ];
    }
}
