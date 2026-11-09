# Gambar dari Unsplash

## Format URL (yang berfungsi)

```
https://images.unsplash.com/photo-<ID>?auto=format&fit=crop&w=<LEBAR>&q=80
```

`<ID>` adalah bagian setelah `photo-` pada URL gambar, misalnya `1540541338287-41700207dee6`.
Jangan pakai `source.unsplash.com` (sudah tidak aktif) atau hotlink halaman `unsplash.com/photos/...`.

| Pemakaian | Lebar (`w`) | Rasio/kontainer |
|---|---|---|
| Hero slide | 2000 | penuh, `object-cover` |
| Panel gelap | 1600 | penuh |
| CTA | 1800 | penuh |
| Kartu carousel | 900 | 4/3 |
| Galeri 4 kartu | 800 | 4/5 |

Kualitas `q=80`. Tambahkan `loading="lazy"` kecuali hero pertama.

## Menemukan ID yang valid

1. Cari dengan WebSearch/WebFetch di `unsplash.com/s/photos/<kata-kunci-inggris>` atau
   `site:unsplash.com <topik>` lalu ambil ID dari URL `images.unsplash.com/photo-...`.
   Jika tool web tidak tersedia, gunakan ID yang sudah teruji di bawah atau minta user menempelkan
   tautan foto pilihan.
2. **Selalu verifikasi**: `scripts/check-images.sh index.html` (harus 200 semua).
3. **Selalu lihat gambarnya.** 200 OK tidak berarti cocok. Unduh thumbnail (`w=400`) ke folder temp dan
   susun contact sheet (PowerShell `System.Drawing` atau `magick montage`), lalu baca gambarnya dan
   cocokkan dengan peran tiap slot. Buang foto yang berisi orang berwajah jelas bila tidak relevan,
   watermark, teks, atau gaya yang berbeda dari set lain.

## Memilih foto

- **Satu gaya**: tone warna & pencahayaan serupa di semua gambar (semua hangat, atau semua sejuk).
- **Hero 3 slide**: tiga suasana berbeda dari tempat/tema yang sama (siang / senja / malam; atau
  pagi / siang / malam; atau tiga sudut ruang). Komposisi dengan ruang kosong di kiri-atas untuk judul.
- **Galeri**: 4 foto bervariasi (eksterior, interior, detail, suasana), semua orientasi portrait-friendly.
- **Kartu**: satu foto per item, framing seragam (sudut & jarak serupa).
- **Panel gelap**: foto bernuansa hangat/gelap agar teks putih terbaca; overlay `dark` menyelesaikan sisanya.
- Hindari: foto stok bergaya "orang tertawa di kantor", gambar dengan teks/logo, foto sangat ramai.
- **Alt text**: deskripsi nyata isi gambar, bahasa Indonesia ("Kolam renang menghadap laut saat senja").
  Slide non-aktif: `alt=""` + `aria-hidden`.
- Lisensi Unsplash memperbolehkan pemakaian bebas; atribusi tidak wajib tapi dihargai. Jika user
  menginginkan, tambahkan baris kredit kecil di footer.

## ID yang sudah teruji (HTTP 200, sudah dilihat)

Hotel/resort/properti — aman dipakai ulang untuk bisnis akomodasi & properti:

| ID | Isi |
|---|---|
| `1540541338287-41700207dee6` | resort tepi laut, kolam tanpa batas, siang (hero) |
| `1551882547-ff40c63fe5fa` | kolam & palem, langit senja ungu (hero senja) |
| `1542314831-068cd1dbfeeb` | hotel berkolam, malam biru (hero malam) |
| `1520250497591-112f2f40a3f4` | kolam tropis, pegunungan |
| `1566073771259-6a8506099945` | lounge kayu tepi kolam saat senja |
| `1564501049412-61c2a3083791` | hotel putih dengan kolam |
| `1571896349842-33c89424de2d` | resort malam, kolam biru |
| `1573843981267-be1999ff37cd` | vila di atas air |
| `1602002418082-a4443e081dd1` | interior vila air, pintu kaca |
| `1631049307264-da0ec9d70304` | kamar standar terang |
| `1568495248636-6432b97bd949` | kamar dengan jendela kota |
| `1595576508898-0ad5c879a061` | kamar twin keluarga |
| `1618773928121-c32242e63f39` | suite hangat |
| `1611892440504-42a792e24d32` | kamar kayu bernuansa tropis |
| `1578683010236-d716f9a3f461` | kamar dengan jendela kaca besar |
| `1590490360182-c33d57733427` | kamar klasik |
| `1613490493576-7fde63acd811` | villa modern berkolam |
| `1600585154340-be6161a56a0c` | rumah kayu-kaca & taman |
| `1600596542815-ffad4c1539a9` | rumah putih modern berkolam |
| `1512917774080-9991f1c4c750` | villa modern, palem |
| `1455587734955-081b22074882` | hotel putih bertingkat dengan palem |
| `1544161515-4ab6ce6db874` | pijat/spa |
| `1414235077428-338989a2e8c0` | hidangan fine dining |
| `1537996194471-e657df975ab4` | pura Bali, pantulan air |

Untuk bisnis lain, cari ID baru memakai kueri di `business-presets.md` — jangan memakai foto hotel
pada bisnis non-akomodasi.

## Pemeriksaan otomatis

```bash
bash .claude/skills/editorial-landing-page/scripts/check-images.sh index.html
```

Keluaran: satu baris per URL (`200 <id>` atau `FAIL <kode> <id>`), exit code ≠ 0 bila ada yang gagal.
