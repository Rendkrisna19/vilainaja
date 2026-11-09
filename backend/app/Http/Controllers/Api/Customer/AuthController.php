<?php

namespace App\Http\Controllers\Api\Customer;

use App\Exceptions\BookingException;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\FirebaseTokenVerifier;
use App\Support\Phone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['required', 'email:rfc', 'max:160', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'max:100', 'confirmed'],
        ], [
            'email.unique' => 'Email ini sudah terdaftar. Silakan masuk.',
        ], [
            'name' => 'nama lengkap',
            'phone' => 'nomor WhatsApp',
            'email' => 'email',
            'password' => 'password',
        ]);

        $phone = $this->phoneOrFail($data['phone']);

        $user = new User([
            'name' => trim($data['name']),
            'email' => strtolower($data['email']),
            'phone' => $phone,
            'password' => $data['password'],
        ]);
        $user->forceFill(['role' => 'customer'])->save();

        return $this->tokenResponse($user, 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ], [], ['email' => 'email', 'password' => 'password']);

        $user = User::where('email', strtolower($data['email']))->where('role', 'customer')->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => 'Email atau password salah.']);
        }

        return $this->tokenResponse($user);
    }

    /** Login / daftar otomatis dengan Google lewat Firebase ID token. */
    public function google(Request $request, FirebaseTokenVerifier $verifier): JsonResponse
    {
        $request->validate(['id_token' => ['required', 'string', 'max:4096']]);

        $claims = $verifier->verify($request->string('id_token'));

        if (! $claims['email'] || ! $claims['email_verified']) {
            throw new BookingException('Email Google Anda belum terverifikasi.', 422);
        }

        $email = strtolower($claims['email']);
        $user = User::where('firebase_uid', $claims['uid'])->first() ?? User::where('email', $email)->first();

        if ($user && $user->role !== 'customer') {
            throw new BookingException('Akun ini tidak dapat masuk lewat Google.', 403);
        }

        if (! $user) {
            $user = new User([
                'name' => $claims['name'] ?: Str::before($email, '@'),
                'email' => $email,
                'password' => Str::random(40), // tidak dipakai; login hanya lewat Google
                'firebase_uid' => $claims['uid'],
                'avatar_url' => $claims['picture'],
            ]);
            $user->forceFill(['role' => 'customer'])->save();
        } elseif (! $user->firebase_uid) {
            $user->forceFill(['firebase_uid' => $claims['uid'], 'avatar_url' => $user->avatar_url ?: $claims['picture']])->save();
        }

        return $this->tokenResponse($user);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $this->payload($request->user())]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'phone' => ['required', 'string', 'max:30'],
        ], [], ['name' => 'nama lengkap', 'phone' => 'nomor WhatsApp']);

        $user = $request->user();
        $user->update(['name' => trim($data['name']), 'phone' => $this->phoneOrFail($data['phone'])]);

        return response()->json(['user' => $this->payload($user->refresh())]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Berhasil keluar.']);
    }

    private function phoneOrFail(string $input): string
    {
        $phone = Phone::normalize($input);

        if (! $phone) {
            throw ValidationException::withMessages([
                'phone' => 'Nomor WhatsApp tidak valid. Contoh: 0812 3456 7890.',
            ]);
        }

        return $phone;
    }

    private function tokenResponse(User $user, int $status = 200): JsonResponse
    {
        $expires = config('sanctum.expiration') ? now()->addMinutes(config('sanctum.expiration')) : null;

        return response()->json([
            'token' => $user->createToken('customer', ['*'], $expires)->plainTextToken,
            'user' => $this->payload($user),
        ], $status);
    }

    private function payload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'avatar_url' => $user->avatar_url,
            'profile_complete' => $user->profileComplete(),
        ];
    }
}
