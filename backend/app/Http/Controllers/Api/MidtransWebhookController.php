<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\BookingService;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Menerima notifikasi pembayaran dari Midtrans. Hanya notifikasi dengan signature valid yang diproses.
 * Daftarkan URL ini di Midtrans Dashboard → Settings → Payment → Notification URL: {APP_URL}/api/payments/midtrans/notification
 */
class MidtransWebhookController extends Controller
{
    public function __invoke(Request $request, MidtransService $midtrans, BookingService $bookings): JsonResponse
    {
        $payload = $request->all();

        if (! $midtrans->verifySignature($payload)) {
            return response()->json(['message' => 'Signature tidak valid.'], 403);
        }

        // Order tak dikenal (mis. tes dari dashboard Midtrans): balas 200 agar tidak di-retry terus.
        $payment = Payment::where('order_id', $payload['order_id'])->first();
        if ($payment) {
            $bookings->applyGatewayStatus($payment, $payload);
        }

        return response()->json(['message' => 'ok']);
    }
}
