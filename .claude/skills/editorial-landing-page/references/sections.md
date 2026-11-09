# Katalog section

Urutan baku (boleh dikurangi, jangan diacak): Hero → Tentang+Statistik → Galeri → Carousel kartu →
Panel gelap → Testimoni → CTA → Footer. Setiap section adalah `<section>` mandiri; salin blok dari
`assets/template.html`.

## 1. Hero (`#hero`)
- **Tujuan**: menyatakan apa bisnisnya dan memberi aksi pertama.
- **Isi**: H1 dua bagian (sans + serif miring), 1–2 kalimat paragraf (≤ 30 kata), 3 slide gambar bertema
  berbeda dengan tab bertanda waktu/suasana, navbar tab-notch, bar pill di dasar.
- **Aturan**: gambar pertama `fetchpriority="high"`; overlay kiri-ke-kanan agar judul terbaca; tab suasana
  ditata kanan-bawah di atas bar (di mobile pindah ke kiri). Jika hanya ada 1 gambar bagus, hapus tab & JS slideshow.
- **Hindari**: tombol CTA ganda di hero (bar pill sudah menjadi aksi), video autoplay, teks di tengah.

## 2. Tentang + Statistik (`#tentang`)
- Dua kolom: label kecil "Tentang Kami" (kiri) dan pernyataan besar (kanan) dengan 2–3 `<em>`.
- Empat statistik: angka serif miring + keterangan 11.5px. Angka harus nyata/masuk akal; tandai bila contoh.

## 3. Galeri bertingkat
- Empat kartu 4/5, ketinggian bertingkat (0 / 28 / 56 / 0 px) di desktop; 2 kolom di mobile.
- Kartu ketiga = kartu bertinta (gradien hitam atas, label + tombol panah putih) yang menaut ke section kartu.
- Semua alt bermakna. Jangan beri caption pada kartu lain.

## 4. Carousel kartu (`#layanan`)
- Kepala: label + H2 dengan `<em>` + dua tombol panah bulat bergaris.
- Kartu: foto (badge opsional), nama serif miring 32px, 1 kalimat, chip fakta, harga + tombol panah hitam.
- Loop tanpa ujung: JS menggandakan kartu menjadi [klon][asli][klon] dan menormalkan posisi scroll.
  Minimal 4 kartu asli agar loop terasa wajar. Jangan beri `overflow-hidden` pada track.
- Indikator: garis tipis dengan thumb 1/N dan penghitung `03 / 06`.

## 5. Panel gelap (`#unggulan`)
- Gambar latar + overlay `dark` dari kiri; judul serif-sans 2 baris; paragraf; 4 poin dengan garis atas tipis; 1 tombol putih.
- Fungsinya memamerkan fasilitas/keunggulan konkret. Tiap poin = nama + fakta (jam, kapasitas, jarak).

## 6. Testimoni
- Header: label + H2 (`<em>`), skor besar serif (4,9) + jumlah ulasan.
- Tiga kartu; yang tengah gelap (`bg-dark`). Isi: bintang `accent`, kutipan 17px, avatar inisial + nama + kota · produk.
- Tanpa foto avatar palsu. Ulasan harus spesifik dan berbeda sudut pandang.

## 7. CTA (`#kontak`)
- Kartu gambar penuh 420px, overlay hitam 45%, judul tengah, 1 kalimat, 1 tombol putih (WhatsApp/telepon/formulir).
- Nomor WhatsApp format `https://wa.me/62…` (tanpa +, tanpa 0 awal).

## 8. Footer
- Logo serif miring 40px + 4 kolom (Alamat, Kontak, Jelajahi, Ikuti) + garis + hak cipta dengan tahun dinamis.

## Variasi yang diperbolehkan
- Menghapus section (mis. galeri atau testimoni) bila tidak ada konten nyata.
- Menambah section dengan bahasa visual yang sama: **FAQ** (akordeon dengan `<details>`, garis `line`, judul serif miring),
  **Lokasi** (peta tersemat dalam kartu radius 20 + daftar jarak), **Harga/paket** (kartu `sand`, satu kartu gelap sebagai pilihan utama),
  **Galeri penuh** (grid masonry 3 kolom, radius 18).
- Mengubah jumlah kartu/poin/testimoni.

## Yang tidak boleh diubah tanpa alasan kuat
- Dua font, pola sans+serif miring, radius besar, bingkai hero putih, navbar tab-notch, palet netral + 1 gelap + 1 aksen.
