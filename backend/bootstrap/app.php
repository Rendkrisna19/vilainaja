<?php

use App\Exceptions\BookingException;
use App\Exceptions\PaymentGatewayException;
use App\Http\Middleware\EnsureRole;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias(['role' => EnsureRole::class]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Semua request ke /api selalu dijawab JSON (termasuk 401/422/404).
        $exceptions->shouldRenderJsonWhen(
            fn ($request) => $request->is('api/*') || $request->expectsJson()
        );

        // Pelanggaran aturan booking & kegagalan gateway: pesan aman ditampilkan ke pengguna.
        $exceptions->render(fn (BookingException $e) => response()->json(
            ['message' => $e->getMessage(), 'code' => $e->reason], $e->status
        ));
        $exceptions->render(fn (PaymentGatewayException $e) => response()->json(
            ['message' => $e->getMessage(), 'code' => 'payment_gateway'], $e->status
        ));
    })->create();
