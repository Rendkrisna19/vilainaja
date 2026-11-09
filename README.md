# vilainaja

```
backend/    Laravel 12 — REST API (Sanctum token), MySQL
frontend/   React + Vite — landing page (/) dan panel admin (/admin)
.claude/    Skill desain landing page
```

## Menjalankan (lokal)

Pastikan MySQL Laragon menyala, lalu:

```bash
# 1) Backend  — http://localhost:8000
cd backend
composer install            # sekali saja
cp .env.example .env && php artisan key:generate   # sekali saja (di sini .env sudah ada)
php artisan migrate --seed  # buat tabel + data awal
composer serve              # server cepat dengan opcache (±70 ms/request)

# 2) Frontend — http://localhost:5173
cd frontend
npm install                 # sekali saja
npm run dev
```

Login admin (data seeder): `admin@gmail.com` / `password123` → http://localhost:5173/admin

`composer serve` sama dengan `php artisan serve`, tetapi mengaktifkan opcache sehingga
jauh lebih cepat di Windows. Ganti ke `php artisan serve` bila perlu.

## Konfigurasi lingkungan (tidak ada yang di-hardcode)

| File | Variabel | Fungsi |
|---|---|---|
| `backend/.env` | `DB_*` | koneksi MySQL |
| | `APP_URL` | URL API |
| | `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS` | origin frontend yang diizinkan (koma = banyak) |
| | `SANCTUM_EXPIRATION` | masa berlaku token login (menit) |
| | `APP_TIMEZONE` | zona waktu (default Asia/Jakarta) |
| `frontend/.env` | `VITE_API_URL` | alamat API, mis. `https://api.domainanda.com/api` |
| | `VITE_APP_NAME` | nama brand di panel admin |

## Deployment singkat

1. **Backend**: set `APP_ENV=production`, `APP_DEBUG=false`, kredensial `DB_*`, `CORS_ALLOWED_ORIGINS` = domain frontend.
   Jalankan `composer install --no-dev -o`, `php artisan migrate --force`, lalu `php artisan config:cache route:cache`.
   Ganti password admin dari seeder sebelum go-live.
2. **Frontend**: isi `VITE_API_URL` lalu `npm run build`; unggah isi `dist/`.
   Karena memakai React Router, arahkan semua path ke `index.html` (SPA fallback), mis. Nginx `try_files $uri /index.html;`.

## API ringkas (`/api`, bearer token kecuali login)

`POST /auth/login` · `GET /auth/me` · `POST /auth/logout` · `GET /dashboard` ·
`/rooms`, `/bookings`, `/leads` (CRUD; `?page=&per_page=&search=&status=`) · `GET|PUT /settings`
