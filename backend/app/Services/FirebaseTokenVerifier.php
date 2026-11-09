<?php

namespace App\Services;

use App\Exceptions\BookingException;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Memverifikasi Firebase ID token (login Google) tanpa service account:
 * tanda tangan RS256 dicek dengan sertifikat publik Google, lalu klaim aud/iss/exp divalidasi.
 */
class FirebaseTokenVerifier
{
    private const CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

    public function isConfigured(): bool
    {
        return filled(config('services.firebase.project_id'));
    }

    /**
     * @return array{uid:string,email:?string,email_verified:bool,name:?string,picture:?string}
     */
    public function verify(string $idToken): array
    {
        if (! $this->isConfigured()) {
            throw new BookingException('Login Google belum dikonfigurasi.', 503);
        }

        $projectId = config('services.firebase.project_id');

        try {
            $keys = collect($this->certificates())->map(fn ($cert) => new Key($cert, 'RS256'))->all();
            JWT::$leeway = 30;
            $claims = (array) JWT::decode($idToken, $keys);
        } catch (Throwable) {
            throw new BookingException('Token Google tidak valid atau sudah kedaluwarsa.', 401);
        }

        if (($claims['aud'] ?? null) !== $projectId
            || ($claims['iss'] ?? null) !== "https://securetoken.google.com/{$projectId}"
            || empty($claims['sub'])) {
            throw new BookingException('Token Google tidak valid.', 401);
        }

        return [
            'uid' => (string) $claims['sub'],
            'email' => $claims['email'] ?? null,
            'email_verified' => (bool) ($claims['email_verified'] ?? false),
            'name' => $claims['name'] ?? null,
            'picture' => $claims['picture'] ?? null,
        ];
    }

    /** @return array<string,string> kid => sertifikat PEM */
    private function certificates(): array
    {
        return Cache::remember('firebase.certs', 3600, function () {
            $response = Http::timeout(10)->get(self::CERTS_URL);
            if (! $response->successful()) {
                throw new \RuntimeException('Gagal mengambil sertifikat Google.');
            }
            return $response->json();
        });
    }
}
