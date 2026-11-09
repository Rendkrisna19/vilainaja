<?php

/*
| CORS untuk API. Origin yang diizinkan diatur lewat .env:
|   CORS_ALLOWED_ORIGINS=https://admin.contoh.com,https://contoh.com
| Autentikasi memakai bearer token (bukan cookie), jadi supports_credentials = false.
*/

return [

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter(array_map(
        'trim',
        explode(',', env('CORS_ALLOWED_ORIGINS', env('FRONTEND_URL', 'http://localhost:5173')))
    ))),

    // Pola regex tambahan (pisahkan dengan |||). Berguna di lokal karena Vite bisa berpindah port.
    // Kosongkan di produksi dan cukup isi CORS_ALLOWED_ORIGINS.
    'allowed_origins_patterns' => array_values(array_filter(array_map(
        'trim',
        explode('|||', env('CORS_ALLOWED_ORIGINS_PATTERNS', ''))
    ))),

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 3600,

    'supports_credentials' => false,

];
