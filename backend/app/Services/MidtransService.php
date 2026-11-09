<?php

namespace App\Services;

use App\Exceptions\PaymentGatewayException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Klien tipis untuk Midtrans Snap. Server key hanya dipakai di sisi server;
 * ke browser hanya dikirim client key + snap token.
 */
class MidtransService
{
    public function isConfigured(): bool
    {
        return filled(config('services.midtrans.server_key')) && filled(config('services.midtrans.client_key'));
    }

    public function clientKey(): ?string
    {
        return config('services.midtrans.client_key');
    }

    public function snapUrl(): string
    {
        return config('services.midtrans.is_production')
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';
    }

    /**
     * Membuat transaksi Snap.
     *
     * @return array{token:string,redirect_url:string}
     */
    public function createSnapTransaction(array $payload): array
    {
        $this->ensureConfigured();

        $response = $this->http($this->snapBase())->post('/snap/v1/transactions', $payload);

        if (! $response->successful() || ! $response->json('token')) {
            Log::warning('Midtrans: gagal membuat transaksi', ['status' => $response->status(), 'body' => $response->json()]);
            throw new PaymentGatewayException('Gagal membuat pembayaran. Silakan coba lagi sebentar lagi.');
        }

        return ['token' => $response->json('token'), 'redirect_url' => $response->json('redirect_url')];
    }

    /** Status transaksi dari Midtrans. Null bila transaksi belum ada di sisi Midtrans (belum dibayar/dibuka). */
    public function status(string $orderId): ?array
    {
        $this->ensureConfigured();

        $response = $this->http($this->apiBase())->get('/v2/'.rawurlencode($orderId).'/status');

        if ($response->status() === 404 || $response->json('status_code') === '404') {
            return null;
        }

        if (! $response->successful()) {
            Log::warning('Midtrans: gagal mengambil status', ['order_id' => $orderId, 'status' => $response->status()]);
            return null;
        }

        return $response->json();
    }

    /** Membatalkan transaksi di Midtrans (best effort, tidak melempar error). */
    public function cancel(string $orderId): void
    {
        if (! $this->isConfigured()) {
            return;
        }

        try {
            $this->http($this->apiBase())->post('/v2/'.rawurlencode($orderId).'/cancel');
        } catch (\Throwable $e) {
            Log::info('Midtrans: pembatalan gagal (diabaikan)', ['order_id' => $orderId, 'error' => $e->getMessage()]);
        }
    }

    /**
     * Memverifikasi signature notifikasi: SHA512(order_id + status_code + gross_amount + server_key).
     */
    public function verifySignature(array $payload): bool
    {
        $key = (string) config('services.midtrans.server_key');

        foreach (['order_id', 'status_code', 'gross_amount', 'signature_key'] as $field) {
            if (! isset($payload[$field]) || ! is_scalar($payload[$field])) {
                return false;
            }
        }

        $expected = hash('sha512', $payload['order_id'].$payload['status_code'].$payload['gross_amount'].$key);

        return $key !== '' && hash_equals($expected, strtolower((string) $payload['signature_key']));
    }

    private function ensureConfigured(): void
    {
        if (! $this->isConfigured()) {
            throw new PaymentGatewayException('Pembayaran online belum dikonfigurasi. Hubungi admin.', 503);
        }
    }

    private function http(string $base): PendingRequest
    {
        return Http::withBasicAuth((string) config('services.midtrans.server_key'), '')
            ->baseUrl($base)
            ->acceptJson()
            ->asJson()
            ->timeout(15)
            ->retry(1, 300, throw: false);
    }

    private function snapBase(): string
    {
        return config('services.midtrans.is_production') ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com';
    }

    private function apiBase(): string
    {
        return config('services.midtrans.is_production') ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com';
    }
}
