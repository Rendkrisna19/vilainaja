# Preset per jenis bisnis

Struktur halaman, tipografi, bentuk, dan gerak **tetap sama**. Yang berubah: warna `dark`/`accent`,
nama section, isi kartu, kolom bar pencarian, kueri gambar, dan nada copy.

Cara memakai: pilih baris terdekat, salin nilainya ke template, lalu sesuaikan dengan data nyata user.

## Peta konten → section template

| Section template | Hotel | Restoran/Kafe | Klinik/Dental | Gym/Studio | Properti | Salon/Spa | Kursus/Sekolah | SaaS/Jasa digital |
|---|---|---|---|---|---|---|---|---|
| Bar pill (4 kolom) | Check-in, Check-out, Tamu, Tipe kamar | Tanggal, Jam, Jumlah orang, Area duduk | Layanan, Dokter, Tanggal, Waktu | Kelas, Level, Hari, Jam | Lokasi, Harga, Kamar tidur, Tipe | Perawatan, Terapis, Tanggal, Jam | Program, Level, Jadwal, Format | *(ganti dengan 1 input email + tombol; atau hapus)* |
| Carousel kartu | Tipe kamar | Menu andalan | Layanan | Kelas/paket | Listing unggulan | Paket perawatan | Program | Paket/fitur utama |
| Panel gelap | Fasilitas | Cerita dapur / bahan | Teknologi & fasilitas | Fasilitas & pelatih | Layanan manajemen properti | Ritual & produk | Metode belajar | Cara kerja / integrasi |
| Tiga tema hero | siang/senja/malam | pagi/siang/malam suasana | ruang tunggu/ruang praktik/tim | kelas pagi/kelas sore/area bebas | eksterior/interior/lingkungan | ruang/perawatan/detail | kelas/lab/kampus | *(gunakan 3 tangkapan produk atau foto tim)* |
| Statistik | tahun berdiri, kamar, tim, tamu | tahun, menu, pemasok lokal, pelanggan | tahun, dokter, pasien, rating | tahun, kelas/minggu, pelatih, anggota | tahun, listing, agen, transaksi | tahun, terapis, perawatan, klien | tahun, program, pengajar, alumni | tahun, pengguna, uptime, negara |
| CTA | WhatsApp reservasi | Reservasi meja | Buat janji | Coba kelas gratis | Jadwalkan kunjungan | Pesan perawatan | Daftar kelas uji | Coba gratis / Jadwalkan demo |

## Palet (ubah `dark` dan `accent`; `sand` boleh bergeser tipis)

| Bisnis | `dark` | `accent` | `sand` | Kesan |
|---|---|---|---|---|
| Hotel / resort tropis | `#2b2118` | `#c9892f` | `#f5f3ef` | hangat, kayu, senja |
| Restoran / kafe | `#2a1a14` | `#b4532a` | `#f6f1ea` | hangat, rempah, kopi |
| Klinik / dental | `#13302f` | `#2f8f83` | `#f1f5f4` | bersih, tenang, medis |
| Gym / studio | `#16181a` | `#d4552b` | `#f2f2f0` | tegas, energik, arang |
| Properti | `#1f2a33` | `#a68a5b` | `#f3f2ef` | tepercaya, netral, batu |
| Salon / spa | `#2f2623` | `#a8715a` | `#f7f2ee` | lembut, tanah liat |
| Kursus / sekolah | `#1b2742` | `#e0a030` | `#f3f4f6` | tepercaya, cerah terkendali |
| SaaS / jasa digital | `#111827` | `#3b6cf6` | `#f4f5f7` | kalem; satu aksen biru, jangan gradien |

Bila brand sudah punya warna, hitung `dark` dari warna brand (lihat design-system §2) dan pakai warna
brand sebagai `accent` — jangan keduanya sama terang.

## Kueri gambar Unsplash (bahasa Inggris)

| Bisnis | Hero | Galeri / kartu | Panel gelap | CTA |
|---|---|---|---|---|
| Hotel | `resort pool sunset`, `hotel night exterior` | `hotel room interior`, `villa pool` | `resort lounge wood` | `tropical pool` |
| Restoran | `restaurant interior warm`, `chef plating` | `plated dish`, `coffee pour over`, `bakery` | `open kitchen`, `fresh ingredients` | `dining table candle` |
| Klinik | `modern clinic interior`, `dental office` | `medical equipment`, `waiting room` | `doctor consultation` (hindari wajah dominan) | `clean reception` |
| Gym | `gym interior morning`, `yoga studio light` | `weights detail`, `group class` | `training equipment dark` | `studio sunrise` |
| Properti | `modern house exterior`, `apartment building dusk` | `living room interior`, `kitchen design` | `property keys handover` | `residential street` |
| Salon/Spa | `spa interior`, `massage oil` | `salon chair`, `skincare products` | `spa stones towel` | `spa candles` |
| Kursus | `classroom natural light`, `workshop` | `notebooks desk`, `lab` | `students discussion` | `campus` |
| SaaS | `desk laptop minimal`, `team workshop` | `dashboard screen` (foto nyata, bukan mockup AI) | `server room dark`, `city night` | `office window` |

## Nada copy

- Tulis seperti pemilik bisnis yang bicara langsung, bukan agensi. Kalimat pendek, spesifik, ada angka/jam/nama tempat.
- Judul hero: dua bagian — kata utama + frasa miring yang menyatakan manfaat ("Beristirahat *tanpa terburu-buru.*",
  "Kopi yang *dibuat pelan-pelan.*", "Senyum *tanpa rasa cemas.*", "Berlatih *sesuai ritme Anda.*",
  "Rumah yang *terasa benar.*").
- Pernyataan Tentang: 1 kalimat dengan 2–3 kata `<em>`, menyebut skala nyata (jumlah, kota, tahun).
- Kartu: nama (serif miring) + satu kalimat manfaat + 2–3 chip fakta + harga/CTA.
- Testimoni: sebut detail konkret (hari ke-2, nama staf, menu, hasil). Tandai sebagai contoh bila karangan.
- Harga: format `Rp1.250.000` (`Intl.NumberFormat('id-ID')`); satuan jelas ("/ malam", "/ sesi", "/ bulan").

## Aturan khusus tiap bisnis

- **Restoran/kafe**: tambahkan jam buka di footer dan CTA reservasi; kartu menu boleh tanpa chip kapasitas.
- **Klinik**: hindari klaim medis berlebihan; tampilkan izin praktik/nama dokter bila ada; CTA "Buat janji".
- **Properti**: kartu = listing (luas, kamar tidur, lokasi, harga); bar pill benar-benar memfilter bila ada data.
- **SaaS**: ganti bar pill dengan form email satu baris (input pill + tombol hitam); gunakan tangkapan layar nyata
  di kartu, bukan ilustrasi; statistik harus bisa diverifikasi.
- **Bisnis tanpa foto bagus**: kurangi jumlah gambar (hero 1 slide, galeri 2 kartu) daripada memakai foto tidak relevan.
