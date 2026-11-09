<?php

namespace App\Services;

use App\Exceptions\BookingException;
use App\Exceptions\PaymentGatewayException;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class BookingService
{
    public function __construct(
        private readonly AvailabilityService $availability,
        private readonly MidtransService $midtrans,
    ) {}

    /**
     * Membuat booking online yang menahan 1 unit kamar selama masa bayar.
     * Aman terhadap klik ganda & permintaan paralel: baris kamar dikunci selama pengecekan + penyimpanan,
     * serta idempotency key / booking pending identik dikembalikan, bukan dibuat ulang.
     *
     * @return array{0: Booking, 1: bool}  [booking, baruDibuat]
     */
    public function createOnline(User $user, array $data): array
    {
        $this->expireOverdue();

        if (! $user->profileComplete()) {
            throw new BookingException('Lengkapi nama dan nomor WhatsApp Anda sebelum memesan.', 422, 'profile_incomplete');
        }

        $in = Carbon::parse($data['check_in'])->toDateString();
        $out = Carbon::parse($data['check_out'])->toDateString();
        $nights = Carbon::parse($in)->diffInDays(Carbon::parse($out));

        if ($in < today()->toDateString()) {
            throw new BookingException('Tanggal check-in tidak boleh sebelum hari ini.');
        }
        if ($nights < 1) {
            throw new BookingException('Tanggal check-out harus setelah check-in.');
        }
        if ($nights > config('booking.max_nights')) {
            throw new BookingException('Maksimal menginap '.config('booking.max_nights').' malam per booking.');
        }

        return DB::transaction(function () use ($user, $data, $in, $out, $nights) {
            // Kunci baris kamar: semua pemesanan kamar yang sama berjalan berurutan.
            $room = Room::whereKey($data['room_id'])->lockForUpdate()->first();

            if (! $room || ! $room->is_active) {
                throw new BookingException('Kamar ini tidak tersedia.', 404);
            }
            if ($data['guests'] > $room->capacity) {
                throw new BookingException("Kapasitas kamar ini maksimal {$room->capacity} tamu.");
            }

            // 1) Klik ulang dengan key yang sama → kembalikan booking yang sama.
            $key = $data['idempotency_key'] ?? null;
            if ($key) {
                $existing = Booking::where('idempotency_key', $key)->first();
                if ($existing) {
                    if ($existing->user_id !== $user->id) {
                        throw new BookingException('Permintaan tidak valid.', 403);
                    }
                    return [$existing->load(['room', 'payment']), false];
                }
            }

            // 2) Booking identik yang masih menunggu bayar → pakai yang itu.
            $duplicate = Booking::where('user_id', $user->id)
                ->where('room_id', $room->id)
                ->where('check_in', $in)->where('check_out', $out)
                ->where('status', 'pending')->where('expires_at', '>', now())
                ->first();
            if ($duplicate) {
                return [$duplicate->load(['room', 'payment']), false];
            }

            // 3) Batasi booking menunggu bayar per pelanggan.
            $pending = Booking::where('user_id', $user->id)->where('status', 'pending')->where('expires_at', '>', now())->count();
            if ($pending >= config('booking.max_pending_per_user')) {
                throw new BookingException('Anda masih memiliki beberapa booking yang belum dibayar. Selesaikan atau batalkan dulu.', 429, 'too_many_pending');
            }

            // 4) Cek sisa unit.
            if ($this->availability->unitsLeft($room, $in, $out) < 1) {
                throw new BookingException('Maaf, kamar ini sudah penuh untuk tanggal tersebut.', 409, 'sold_out');
            }

            $total = (int) ($room->price * $nights);

            $booking = Booking::create([
                'room_id' => $room->id,
                'user_id' => $user->id,
                'guest_name' => $user->name,
                'guest_email' => $user->email,
                'guest_phone' => $user->phone,
                'check_in' => $in,
                'check_out' => $out,
                'guests' => $data['guests'],
                'total_price' => $total,
                'status' => 'pending',
                'source' => 'online',
                'expires_at' => now()->addMinutes(config('booking.hold_minutes')),
                'idempotency_key' => $key,
                'notes' => $data['notes'] ?? null,
            ]);

            Payment::create([
                'booking_id' => $booking->id,
                'order_id' => $booking->code,
                'gross_amount' => $total,
                'status' => Payment::PENDING,
            ]);

            return [$booking->load(['room', 'payment']), true];
        });
    }

    /** Membuat (atau memakai ulang) token Snap untuk booking yang menunggu pembayaran. */
    public function startPayment(Booking $booking): Payment
    {
        $booking->loadMissing(['room', 'payment', 'user']);
        $payment = $booking->payment;

        if ($payment->status === Payment::PAID) {
            return $payment;
        }
        if ($booking->status !== 'pending' || ($booking->expires_at && $booking->expires_at->isPast())) {
            throw new BookingException('Waktu pembayaran sudah habis. Silakan buat pesanan baru.', 410, 'expired');
        }
        if ($payment->snap_token) {
            return $payment; // token masih berlaku sampai batas bayar
        }

        $nights = $booking->check_in->diffInDays($booking->check_out);
        $name = Str::limit("{$booking->room->name} · {$nights} malam", 50, '');

        $result = $this->midtrans->createSnapTransaction([
            'transaction_details' => ['order_id' => $payment->order_id, 'gross_amount' => $payment->gross_amount],
            'item_details' => [['id' => (string) $booking->room_id, 'price' => $payment->gross_amount, 'quantity' => 1, 'name' => $name]],
            'customer_details' => [
                'first_name' => Str::limit($booking->guest_name, 100, ''),
                'email' => $booking->guest_email,
                'phone' => $booking->guest_phone,
            ],
            'expiry' => ['unit' => 'minutes', 'duration' => max(1, (int) now()->diffInMinutes($booking->expires_at, false))],
            'callbacks' => ['finish' => config('booking.frontend_url').'/akun/booking/'.$booking->code],
        ]);

        $payment->update(['snap_token' => $result['token'], 'redirect_url' => $result['redirect_url']]);

        return $payment->refresh();
    }

    /** Melepas tahanan kamar bila pembayaran gagal dibuat. */
    public function release(Booking $booking, string $reason): void
    {
        DB::transaction(function () use ($booking, $reason) {
            $booking = Booking::whereKey($booking->id)->lockForUpdate()->first();
            if ($booking && $booking->status === 'pending') {
                $booking->update(['status' => 'cancelled', 'cancel_reason' => $reason, 'expires_at' => null]);
                $booking->payment?->update(['status' => Payment::CANCELLED]);
            }
        });
    }

    public function cancelByCustomer(Booking $booking): Booking
    {
        DB::transaction(function () use ($booking) {
            $booking = Booking::whereKey($booking->id)->lockForUpdate()->first();
            $payment = $booking->payment;

            if ($booking->status !== 'pending' || $payment?->status === Payment::PAID) {
                throw new BookingException('Booking ini tidak dapat dibatalkan.', 409);
            }

            $booking->update(['status' => 'cancelled', 'cancel_reason' => 'Dibatalkan pelanggan', 'expires_at' => null]);
            $payment?->update(['status' => Payment::CANCELLED]);
        });

        $booking->refresh();
        if ($booking->payment?->snap_token) {
            $this->midtrans->cancel($booking->payment->order_id);
        }

        return $booking->load(['room', 'payment']);
    }

    /** Membatalkan semua booking yang melewati batas bayar. Aman dijalankan berulang. */
    public function expireOverdue(): int
    {
        $count = 0;

        Booking::overdue()->limit(200)->pluck('id')->each(function ($id) use (&$count) {
            DB::transaction(function () use ($id, &$count) {
                $b = Booking::whereKey($id)->lockForUpdate()->first();
                if (! $b || $b->status !== 'pending' || ! $b->expires_at || $b->expires_at->isFuture()) {
                    return;
                }
                if ($b->payment?->status === Payment::PAID) {
                    return;
                }
                $b->update(['status' => 'cancelled', 'cancel_reason' => 'Waktu pembayaran habis']);
                $b->payment?->update(['status' => Payment::EXPIRED]);
                $count++;
            });
        });

        return $count;
    }

    /**
     * Menerapkan status transaksi dari Midtrans (notifikasi ATAU polling status).
     * Idempoten: aman dipanggil berkali-kali; pembayaran yang sudah lunas tidak pernah diturunkan.
     */
    public function applyGatewayStatus(Payment $payment, array $payload): Payment
    {
        return DB::transaction(function () use ($payment, $payload) {
            $payment = Payment::whereKey($payment->id)->lockForUpdate()->firstOrFail();
            $booking = Booking::whereKey($payment->booking_id)->lockForUpdate()->firstOrFail();

            // Nominal harus sama persis dengan yang kita minta.
            $gross = (int) round((float) ($payload['gross_amount'] ?? 0));
            if ($gross !== $payment->gross_amount) {
                Log::warning('Midtrans: nominal tidak cocok', ['order_id' => $payment->order_id, 'got' => $gross, 'expected' => $payment->gross_amount]);
                return $payment;
            }

            if ($payment->status === Payment::PAID) {
                return $payment; // sudah lunas; abaikan notifikasi susulan
            }

            $status = $this->mapStatus((string) ($payload['transaction_status'] ?? ''), $payload['fraud_status'] ?? null);

            $payment->fill([
                'payment_type' => $payload['payment_type'] ?? $payment->payment_type,
                'transaction_id' => $payload['transaction_id'] ?? $payment->transaction_id,
                'fraud_status' => $payload['fraud_status'] ?? $payment->fraud_status,
                'raw' => collect($payload)->except(['signature_key'])->all(),
            ]);

            if ($status === Payment::PAID) {
                $payment->fill(['status' => Payment::PAID, 'paid_at' => now()]);

                if ($booking->status === 'pending') {
                    $booking->update(['status' => 'confirmed', 'expires_at' => null]);
                } elseif ($booking->status === 'cancelled') {
                    // Bayar tepat setelah kedaluwarsa: hidupkan lagi bila kamar masih ada.
                    Room::whereKey($booking->room_id)->lockForUpdate()->first();
                    $in = $booking->check_in->toDateString();
                    $out = $booking->check_out->toDateString();
                    if ($this->availability->unitsLeft($booking->room, $in, $out, $booking->id) > 0) {
                        $booking->update(['status' => 'confirmed', 'expires_at' => null, 'cancel_reason' => null]);
                    } else {
                        $payment->status = Payment::REFUND_NEEDED;
                        Log::warning('Midtrans: pembayaran masuk setelah kedaluwarsa dan kamar sudah terisi', ['order_id' => $payment->order_id]);
                    }
                }
            } elseif (in_array($status, [Payment::CANCELLED, Payment::EXPIRED], true)) {
                $payment->status = $status;
                if ($booking->status === 'pending') {
                    $booking->update([
                        'status' => 'cancelled',
                        'expires_at' => null,
                        'cancel_reason' => $status === Payment::EXPIRED ? 'Waktu pembayaran habis' : 'Pembayaran dibatalkan',
                    ]);
                }
            } else {
                // pending / failed: percobaan bayar bisa diulang selama masa tahan belum habis.
                $payment->status = $status;
            }

            $payment->save();

            return $payment;
        });
    }

    /** Menyelaraskan status dengan Midtrans (penting di lokal, karena webhook tidak bisa menjangkau localhost). */
    public function syncPayment(Payment $payment): Payment
    {
        $payment->loadMissing('booking');

        if ($payment->status === Payment::PAID || $payment->booking->status !== 'pending' || ! $this->midtrans->isConfigured()) {
            return $payment;
        }
        if ($payment->last_synced_at && $payment->last_synced_at->diffInSeconds(now()) < 4) {
            return $payment;
        }

        $payment->forceFill(['last_synced_at' => now()])->save();

        try {
            $remote = $this->midtrans->status($payment->order_id);
        } catch (PaymentGatewayException) {
            return $payment;
        }

        return $remote ? $this->applyGatewayStatus($payment, $remote) : $payment;
    }

    private function mapStatus(string $transaction, ?string $fraud): string
    {
        return match (true) {
            $transaction === 'settlement' => Payment::PAID,
            $transaction === 'capture' => $fraud === 'challenge' ? Payment::PENDING : Payment::PAID,
            in_array($transaction, ['deny', 'failure'], true) => Payment::FAILED,
            $transaction === 'cancel' => Payment::CANCELLED,
            $transaction === 'expire' => Payment::EXPIRED,
            default => Payment::PENDING,
        };
    }
}
