# Design system

Sumber kebenaran visual untuk semua proyek. Nilai di sini sudah tertanam di `assets/template.html`.

## 1. Tipografi

Dua keluarga font saja, dimuat dari Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@300;400;500;600&display=swap" rel="stylesheet" />
```

| Peran | Font | Gaya |
|---|---|---|
| Badan, UI, judul besar | **Inter Tight** (`font-sans`) | 400 untuk judul, 500 untuk tombol/label tebal, tracking negatif pada ukuran besar |
| Aksen, angka, nama kartu, logo | **Instrument Serif** (`font-serif`) | selalu *italic*, weight 400 |

Aturan: semua `<em>` otomatis serif miring (`@layer base { em { @apply font-serif italic font-normal } }`).
Jangan pakai `font-bold`/`font-extrabold` pada judul besar. Jangan tambah font ketiga.

### Skala (gunakan persis)

| Elemen | Ukuran | Line-height | Tracking |
|---|---|---|---|
| H1 hero | `clamp(48px, 9vw, 116px)` | .98 | -0.035em |
| H1 baris italic | ikut H1, `ml-[.8em]` (menjorok), `whitespace-nowrap` di ≥sm | | -0.01em |
| H2 panel gelap | `clamp(44px, 6vw, 68px)` | 1 | -0.03em |
| H2 CTA | `clamp(38px, 5.4vw, 64px)` | 1.02 | -0.03em |
| H2 section (`.h-section`) | `clamp(32px, 4.4vw, 52px)` | 1.08 | -0.03em; `<em>` 1.06em |
| Pernyataan "Tentang" | `clamp(26px, 3vw, 36px)` | 1.25 | -0.02em; `<em>` 1.08em |
| Angka statistik | `clamp(34px, 4vw, 46px)` serif italic | 1.1 | -0.03em |
| Nama kartu | 32px serif italic | 1.1 | |
| Paragraf hero | `clamp(15px, 1.35vw, 18px)` | 1.55 | |
| Badan | 13.5–17px | 1.5–1.6 | |
| Label kecil (`.label`) | 12px | | |
| Keterangan | 11–12.5px, `text-muted` | | |

Pola khas: **kata utama sans besar + baris kedua serif miring menjorok**. Contoh: `Beristirahat` /
*tanpa terburu-buru.* Dalam kalimat: bungkus 1–3 kata kunci dengan `<em>`.

## 2. Warna

Token (di `tailwind.config`):

| Token | Default | Pakai untuk |
|---|---|---|
| `ink` | `#141414` | teks utama, tombol utama |
| `muted` | `#6b6b6b` | teks sekunder |
| `line` | `#e7e5e1` | garis tipis, border chip |
| `sand` | `#f5f3ef` | permukaan lembut: kartu, lingkaran ikon, hover |
| `dark` | `#2b2118` | panel gelap, kartu testimoni penekanan — **ubah per brand** |
| `accent` | `#c9892f` | bintang rating, penanda kecil — **ubah per brand** |
| putih | `#fff` | latar halaman, tab navbar, bar pill |

Cara menurunkan `dark`/`accent` untuk brand baru: ambil hue dominan dari foto hero, turunkan
lightness ke ~12–18% dan saturasi ke 25–45% untuk `dark` (cokelat tua, hijau hutan tua, biru malam,
arang). `accent` = hue serupa/komplementer hangat, saturasi sedang, hanya dipakai ≤3 tempat.
Sand tetap netral hangat; boleh digeser sedikit ke arah hue brand (`#f4f1ec`, `#f1f3f0`).

Overlay foto selalu hitam transparan (`from-black/45`, `bg-dark/85`), bukan warna cerah.

## 3. Bentuk, spasi, layout

- Container `.wrap`: `max-w-[1240px]`, padding `clamp(20px, 5vw, 72px)`.
- Radius: hero 26px (20px di mobile), panel/CTA 20px, kartu 22–24px, gambar dalam kartu 18px,
  chip/tombol/pill `rounded-full`.
- Ritme vertikal: antar-section 72–104px (mobile 56–72px). Heading → konten 36–40px.
- Hero: bingkai putih `p-1.5`, tinggi `min(92vh, 820px)` (mobile 720px).
- Navbar: tab putih menempel di tepi atas. Tab tengah (menu) + tab kanan (CTA), radius bawah 26px,
  sudut cekung lewat pseudo-element `.notch` (radial-gradient). Logo serif miring di kiri atas, putih.
- Bar pencarian: pill putih melayang di dasar hero, 4 kolom + tombol hitam; di <lg menjadi grid 2 kolom,
  di <sm 1 kolom.
- Galeri 4 kartu rasio 4/5, bertingkat (`mt-0 / 7 / 14 / 0`); kartu ke-3 punya label + tombol panah.
- Kartu carousel: lebar `min(380px, 82vw)`, latar `sand`, foto 4/3 dengan margin 8px dan radius 18px.

## 4. Ikon

- Sprite `<symbol>` inline di awal `<body>`; panggil `<svg class="..."><use href="#i-nama"/></svg>`.
- Gaya: `fill-none stroke-current stroke-[1.8]`, `linecap/linejoin round`, viewBox 24, tampil 15–18px.
- Ikon fungsional dalam lingkaran `h-[38px] w-[38px] rounded-full bg-sand`.
- Tombol panah ujung kartu: lingkaran hitam 42px, hover `rotate-45`.
- Tambah ikon baru dengan gaya identik (garis sederhana, tanpa isi, tanpa ornamen). Set yang tersedia:
  arrow-ur, arrow-l, arrow-r, chevron, check, pin, users, tag, wallet, ruler, clock, menu, close, star.
  Untuk bisnis lain buat simbol sendiri (mis. fork-knife, tooth, dumbbell, home) dengan gaya yang sama.
- Dilarang: emoji, ikon berwarna, ikon dalam kotak bergradien, ikon dekoratif tanpa fungsi.

## 5. Gerak

| Efek | Nilai |
|---|---|
| Reveal section | opacity 0→1 + translateY 24→0, .8s ease, IntersectionObserver threshold .15 |
| Hero slideshow | crossfade 1.4s, zoom 1.06→1 selama 8s, interval 6.5s, jeda saat hover, preload semua gambar |
| Progress tab hero | garis 2px terisi linear selama interval |
| Hover gambar | `scale-105`, 700ms |
| Hover tombol | `-translate-y-0.5` atau ganti warna, 200ms |
| Carousel | scroll-snap, panah smooth-scroll, drag mouse, loop tanpa ujung |

Semua animasi dimatikan/dikurangi di `prefers-reduced-motion: reduce`.

## 6. Aksesibilitas & kualitas

- `lang="id"`, satu `<h1>`, urutan heading benar, `aria-label` pada tombol ikon, `role="tablist"` pada
  pemilih hero, `aria-hidden` + `tabindex=-1` pada klon carousel.
- Kontras: teks di atas foto selalu diberi overlay; teks putih ≥ 15px.
- Fokus terlihat (`focus-visible`) pada dropdown dan tombol.
- Gambar `loading="lazy"` kecuali hero slide pertama (`fetchpriority="high"`).

## 7. Larangan ("AI slop")

- Gradien ungu→biru, glassmorphism berlebihan, glow/neon, bayangan tebal berwarna.
- Hero generik "Selamat datang di…", "Solusi terbaik untuk…", subjudul klise.
- Tiga kotak fitur beremoji / ikon identik dengan judul 2 kata + deskripsi samar.
- Statistik tanpa konteks, testimoni generik ("Pelayanan sangat bagus!"), logo klien palsu.
- Terlalu banyak badge, garis dekoratif, partikel, blob SVG.
- Mencampur lebih dari satu gaya radius/ikon/foto (mis. foto bergaya berbeda-beda).
- Teks Inggris tercampur pada situs berbahasa Indonesia (kecuali istilah umum: check-in, Wi-Fi).
