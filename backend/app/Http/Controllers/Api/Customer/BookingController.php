<?php

namespace App\Http\Controllers\Api\Customer;

use App\Exceptions\PaymentGatewayException;
use App\Http\Controllers\Controller;
use App\Http\Resources\CustomerBookingResource;
use App\Models\Booking;
use App\Services\BookingService;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(
        private readonly BookingService $bookings,
        private readonly MidtransService $midtrans,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->bookings->expireOverdue();

        $items = Booking::with(['room:id,name,slug,image_url', 'payment'])
            ->where('user_id', $request->user()->id)
            ->latest('id')
            ->limit(100)
            ->get();

        return response()->json(['data' => CustomerBookingResource::collection($items)->resolve()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'room_id' => ['required', 'integer', 'exists:rooms,id'],
            'check_in' => ['required', 'date_format:Y-m-d'],
            'check_out' => ['required', 'date_format:Y-m-d', 'after:check_in'],
            'guests' => ['required', 'integer', 'min:1', 'max:20'],
            'notes' => ['nullable', 'string', 'max:500'],
            'idempotency_key' => ['nullable', 'string', 'max:64'],
        ], [], [
            'room_id' => 'kamar', 'check_in' => 'tanggal check-in', 'check_out' => 'tanggal check-out',
            'guests' => 'jumlah tamu', 'notes' => 'catatan',
        ]);

        [$booking, $created] = $this->bookings->createOnline($request->user(), $data);

        try {
            $payment = $this->bookings->startPayment($booking);
        } catch (PaymentGatewayException $e) {
            // Kamar baru ditahan untuk transaksi ini → lepas lagi agar tidak terkunci sia-sia.
            if ($created) {
                $this->bookings->release($booking, 'Gagal membuat pembayaran');
            }
            throw $e;
        }

        return response()->json($this->withPayment($booking->refresh()->load(['room', 'payment']), $payment->snap_token), $created ? 201 : 200);
    }

    public function show(Request $request, string $code): JsonResponse
    {
        $this->bookings->expireOverdue();

        $booking = $this->own($request, $code);

        if ($booking->payment) {
            $this->bookings->syncPayment($booking->payment);
            $booking->refresh()->load(['room', 'payment']);
        }

        return response()->json(['data' => (new CustomerBookingResource($booking))->resolve()]);
    }

    /** Membuka kembali pembayaran (token yang sama selama masa bayar belum habis). */
    public function pay(Request $request, string $code): JsonResponse
    {
        $this->bookings->expireOverdue();

        $booking = $this->own($request, $code);
        $payment = $this->bookings->startPayment($booking);

        return response()->json($this->withPayment($booking->refresh()->load(['room', 'payment']), $payment->snap_token));
    }

    public function cancel(Request $request, string $code): JsonResponse
    {
        $booking = $this->bookings->cancelByCustomer($this->own($request, $code));

        return response()->json(['data' => (new CustomerBookingResource($booking))->resolve()]);
    }

    private function own(Request $request, string $code): Booking
    {
        return Booking::with(['room:id,name,slug,image_url', 'payment'])
            ->where('code', $code)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();
    }

    private function withPayment(Booking $booking, ?string $token): array
    {
        return [
            'data' => (new CustomerBookingResource($booking))->resolve(),
            'payment' => [
                'snap_token' => $token,
                'client_key' => $this->midtrans->clientKey(),
                'snap_url' => $this->midtrans->snapUrl(),
            ],
        ];
    }
}
