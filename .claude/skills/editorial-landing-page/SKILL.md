---
name: editorial-landing-page
description: Membuat landing page bisnis bergaya editorial modern (sans besar + aksen serif miring, hero inset dengan navbar tab-notch, bar pencarian pill, kartu bertingkat, carousel infinite, panel gelap, testimoni) memakai HTML + Tailwind CSS, foto Unsplash terverifikasi, dan ikon SVG konsisten. Gunakan saat user minta membuat landing page / website company profile / promosi bisnis (hotel, restoran, klinik, gym, properti, jasa, SaaS, dll.), terutama bila minta desain rapi "tidak terlihat AI slop", konten bahasa Indonesia, atau tipografi yang konsisten antar-proyek.
---

# Editorial Landing Page (HTML + Tailwind)

Skill ini mengubah satu sistem desain yang sudah terbukti (dibangun untuk hotel *vilainaja*) menjadi
resep yang bisa dipakai untuk bisnis apa pun. Hasil akhirnya: satu file `index.html` (Tailwind via CDN,
JS vanilla) yang langsung bisa dibuka, responsif, dan terasa dirancang manusia.

## Isi skill

| File | Gunakan untuk |
|---|---|
| `assets/template.html` | **Titik awal.** Landing page lengkap yang sudah jalan (hero slideshow, navbar notch, bar pill, carousel infinite, dll.). Salin lalu ganti konten. |
| `references/design-system.md` | Token: font, skala tipografi, warna, radius, spasi, motion, aturan wajib & larangan. **Baca sebelum mengubah gaya apa pun.** |
| `references/business-presets.md` | Adaptasi per jenis bisnis: palet, nama section, kueri gambar, nada copy, CTA. |
| `references/images-unsplash.md` | Cara memilih & memverifikasi foto Unsplash, ukuran, alt text. |
| `references/sections.md` | Katalog section: tujuan, aturan layout, aturan copy, variasi. |
| `scripts/check-images.sh` | Cek semua URL Unsplash di sebuah file HTML (HTTP 200) sebelum diserahkan. |

## Alur kerja

1. **Pahami bisnis.** Tanyakan hanya jika benar-benar belum ada: nama brand, jenis bisnis, kota, 3–6
   layanan/produk beserta harga (atau tulis jelas bahwa itu contoh), kontak. Selain itu pakai default
   wajar dan sebutkan asumsi di akhir. Bahasa konten mengikuti permintaan user (default Indonesia).
2. **Pilih preset** di `references/business-presets.md` (atau turunkan sendiri dengan aturan yang sama):
   tentukan warna `dark` + `accent`, nama tiap section, dan 3 tema hero.
3. **Salin template** ke folder proyek sebagai `index.html`. Jangan menulis dari nol — template memuat
   markup, JS, dan detail halus yang sulit direproduksi (sudut cekung navbar, carousel loop, dropdown).
4. **Ganti konten** sesuai preset: teks, angka, kartu, testimoni, footer. Tambah/kurangi `<article>` di
   carousel dan `<li>` poin sesuai kebutuhan; jangan mengubah ritme layout.
5. **Cari & verifikasi gambar** (lihat `images-unsplash.md`): kumpulkan kandidat ID, jalankan
   `scripts/check-images.sh`, lalu *lihat* hasilnya (contact sheet) agar cocok dengan bisnis. Minimal:
   3 hero, 4 galeri, 1 gambar per kartu, 1 panel gelap, 1 CTA.
6. **Sesuaikan token** di blok `tailwind.config` (warna `dark`, `accent`). Font TIDAK diganti kecuali user
   meminta — konsistensi tipografi adalah inti skill ini.
7. **Verifikasi**: buka di browser (atau jalankan dev server/`npx serve`), cek lebar 390 / 768 / 1280,
   pastikan tidak ada overflow horizontal, gambar muat, carousel berputar, dropdown terbuka.
8. **Laporkan** ringkas: apa yang dibuat, asumsi/konten karangan yang harus diganti (harga, alamat,
   ulasan, nomor WhatsApp), dan cara membukanya.

## Aturan inti (ringkas — detail di design-system.md)

- **Tipografi**: judul = Inter Tight 400, tracking rapat. Kata aksen = `<em>` (Instrument Serif miring).
  Satu–dua aksen per judul, jangan lebih. Angka statistik & nama kartu juga serif miring.
- **Warna**: dasar putih + `sand` hangat, teks `ink`. Satu warna gelap brand (`dark`) untuk panel & kartu
  penekanan, satu `accent` kecil. **Tanpa gradien warna-warni, tanpa ungu/biru neon, tanpa glow.**
  Gradien hanya overlay hitam transparan di atas foto demi keterbacaan.
- **Bentuk**: sudut besar (kartu 18–24px, hero 26px, tombol/pill 999px). Hero ditanam dalam bingkai
  putih 6px, navbar berupa tab putih yang menempel di tepi atas dengan sudut cekung.
- **Gambar**: foto asli Unsplash yang sudah diverifikasi, `object-cover`, rasio konsisten, alt deskriptif.
  Jangan ilustrasi AI/stok kartun, jangan placeholder abu-abu.
- **Ikon**: sprite SVG inline, garis 1.8px, bulat. Ikon dalam lingkaran `bg-sand` 38px. Tanpa emoji.
- **Copy**: konkret dan spesifik (angka, nama tempat, jam). Larang: "solusi terbaik", "inovatif",
  "terdepan", "dunia baru", "revolusioner", "tak tertandingi", tiga-kolom fitur generik dengan ikon.
- **Gerak**: reveal naik-pelan saat scroll, crossfade hero 1,4 dtk, hover scale 1.04–1.05. Hormati
  `prefers-reduced-motion`.
- **Modular**: walau satu file, setiap section = `<section>` mandiri dengan komentar pembuka; kelas
  berulang dipusatkan di `@layer components` (`.wrap`, `.label`, `.h-section`, `.pill-btn`).

## Tailwind: mode dan produksi

Template memakai Tailwind Play CDN (`<script src="https://cdn.tailwindcss.com">`) supaya langsung jalan
tanpa build. Untuk produksi, bila user meminta, ganti dengan CLI:

```bash
npm i -D tailwindcss@3 && npx tailwindcss init
# pindahkan isi tailwind.config dari template ke tailwind.config.js (theme.extend)
# pindahkan <style type="text/tailwindcss"> ke src/input.css dengan @tailwind base/components/utilities
npx tailwindcss -i src/input.css -o dist/output.css --minify
```

Jika user ingin React/Vite + Tailwind, port per section dengan struktur komponen
`components/<Nama>/<Nama>.jsx`, data teks dipisah ke `data/site.js`; kelas Tailwind dan token tetap sama.

## Checklist sebelum selesai

- [ ] Tidak ada teks "Namabrand", "Nama Layanan", "Deskripsi gambar", "Contoh" yang tersisa.
- [ ] Semua gambar HTTP 200 dan relevan dengan bisnis (bukan sisa foto hotel pada bisnis lain).
- [ ] `<title>`, meta description, `lang="id"`, alt gambar terisi dan bermakna.
- [ ] Hanya dua font (Inter Tight + Instrument Serif); tidak ada font ketiga.
- [ ] Tidak ada overflow horizontal di 390px; navbar mobile berfungsi.
- [ ] Konten karangan (harga, statistik, ulasan, alamat, nomor) ditandai di laporan akhir.
