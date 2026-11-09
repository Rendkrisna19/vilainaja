const img = (id, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

export const brand = 'vilainaja'

export const navLinks = [
  { label: 'Tentang', href: '#tentang' },
  { label: 'Kamar', href: '#kamar' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Kontak', href: '#kontak' },
]

export const hero = {
  slides: [
    { label: 'Siang', image: img('1540541338287-41700207dee6', 2000), alt: 'Kolam tanpa batas menghadap laut biru di siang hari' },
    { label: 'Senja', image: img('1551882547-ff40c63fe5fa', 2000), alt: 'Kolam dan pohon palem di bawah langit senja ungu' },
    { label: 'Malam', image: img('1542314831-068cd1dbfeeb', 2000), alt: 'Hotel dengan kolam berpendar lampu di malam hari' },
  ],
  interval: 6500,
  titleTop: 'Beristirahat',
  titleItalic: 'tanpa terburu-buru.',
  text: 'Villa dan kamar butik di tengah Ubud, Bali. Bangun dengan suara burung, sarapan di tepi kolam, dan pulang membawa kepala yang lebih ringan.',
}

export const roomTypeOptions = [
  'Semua tipe',
  'Kamar Standar',
  'Kamar Deluxe',
  'Kamar Keluarga',
  'Suite Eksekutif',
  'Villa Taman',
  'Villa Air',
]

export const about = {
  label: 'Tentang Kami',
  parts: [
    'Kami mengelola ',
    { em: 'satu properti' },
    ' di Ubud dengan 48 kamar dan villa, dirancang agar setiap tamu mendapat ruang yang ',
    { em: 'tenang' },
    ' dan layanan yang ',
    { em: 'personal' },
    '.',
  ],
  stats: [
    { value: '2016', label: 'Tahun kami berdiri' },
    { value: '48', label: 'Kamar dan villa' },
    { value: '120', label: 'Anggota tim' },
    { value: '18.400', label: 'Tamu yang menginap' },
  ],
}

export const gallery = [
  { src: img('1613490493576-7fde63acd811', 800), alt: 'Villa modern dengan kolam renang pribadi' },
  { src: img('1455587734955-081b22074882', 800), alt: 'Bangunan hotel putih dengan balkon dan pohon palem' },
  { src: img('1578683010236-d716f9a3f461', 800), alt: 'Kamar villa dengan jendela kaca besar', label: 'Villa privat', href: '#kamar' },
  { src: img('1600585154340-be6161a56a0c', 800), alt: 'Rumah kayu dan kaca dengan taman' },
]

export const rooms = [
  {
    id: 'standar',
    name: 'Kamar Standar',
    image: img('1631049307264-da0ec9d70304', 900),
    size: 24,
    guests: 2,
    bed: '1 Queen',
    price: 850000,
    note: 'Ringkas, terang, dan tenang. Cocok untuk perjalanan singkat.',
  },
  {
    id: 'deluxe',
    name: 'Kamar Deluxe',
    image: img('1568495248636-6432b97bd949', 900),
    size: 32,
    guests: 2,
    bed: '1 King',
    price: 1250000,
    note: 'Jendela lebar menghadap kota, dengan sudut kerja di dekat jendela.',
    tag: 'Terpopuler',
  },
  {
    id: 'keluarga',
    name: 'Kamar Keluarga',
    image: img('1595576508898-0ad5c879a061', 900),
    size: 42,
    guests: 4,
    bed: '2 Twin',
    price: 1650000,
    note: 'Dua tempat tidur besar dan ruang gerak lega untuk anak-anak.',
  },
  {
    id: 'suite',
    name: 'Suite Eksekutif',
    image: img('1618773928121-c32242e63f39', 900),
    size: 58,
    guests: 2,
    bed: '1 King',
    price: 2450000,
    note: 'Ruang tidur dan ruang duduk terpisah, bathtub, dan sarapan di kamar.',
  },
  {
    id: 'villa-taman',
    name: 'Villa Taman',
    image: img('1611892440504-42a792e24d32', 900),
    size: 75,
    guests: 3,
    bed: '1 King',
    price: 3400000,
    note: 'Villa berdiri sendiri dengan teras dan taman tropis pribadi.',
  },
  {
    id: 'villa-air',
    name: 'Villa Air',
    image: img('1602002418082-a4443e081dd1', 900),
    size: 96,
    guests: 4,
    bed: '1 King + sofa',
    price: 4900000,
    note: 'Dek langsung ke air, pintu kaca melengkung, dan pemandangan terbuka.',
    tag: 'Paling eksklusif',
  },
]

export const facilities = {
  titleTop: 'Fasilitas',
  titleItalic: 'untuk tamu',
  text: 'Semua yang Anda perlukan sudah ada di dalam properti, sehingga Anda tidak perlu ke mana-mana kecuali memang ingin.',
  image: img('1566073771259-6a8506099945', 1600),
  items: [
    { title: 'Kolam tanpa batas', text: 'Buka 06.00–21.00, dengan handuk dan kabana.' },
    { title: 'Spa dan pijat', text: 'Terapis bersertifikat, reservasi mulai 60 menit.' },
    { title: 'Restoran Taman', text: 'Menu Nusantara dan sarapan hingga pukul 11.00.' },
    { title: 'Antar-jemput bandara', text: 'Dari Bandara Ngurah Rai, sekitar 75 menit.' },
  ],
}

export const cta = {
  titleTop: 'Siap menginap',
  titleItalic: 'bersama kami?',
  text: 'Kirim tanggal dan jumlah tamu. Tim kami membalas dalam satu jam pada jam operasional.',
  button: 'Hubungi via WhatsApp',
  href: 'https://wa.me/6281234567890',
  image: img('1520250497591-112f2f40a3f4', 1800),
}

export const footer = {
  address: 'Jl. Raya Ubud No. 18, Ubud, Gianyar, Bali 80571',
  phone: '+62 812-3456-7890',
  email: 'halo@vilainaja.id',
  hours: 'Resepsionis 24 jam',
  social: [
    { label: 'Instagram', href: '#' },
    { label: 'Facebook', href: '#' },
    { label: 'TikTok', href: '#' },
  ],
}

export const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

// Cadangan bila API tidak dapat dijangkau: kartu tetap tampil (tanpa info ketersediaan).
const SLUGS = { standar: 'kamar-standar', deluxe: 'kamar-deluxe', keluarga: 'kamar-keluarga', suite: 'suite-eksekutif', 'villa-taman': 'villa-taman', 'villa-air': 'villa-air' }
export const fallbackRooms = rooms.map((r) => ({
  ...r,
  slug: SLUGS[r.id],
  image_url: r.image,
  description: r.note,
  capacity: r.guests,
  price: r.price,
}))

export const faq = {
  label: 'FAQ',
  titleTop: 'Pertanyaan yang',
  titleItalic: 'sering diajukan',
  text: 'Tidak menemukan jawabannya? Tinggalkan pesan lewat formulir di bawah, tim kami membalas lewat WhatsApp.',
  items: [
    {
      q: 'Jam berapa check-in dan check-out?',
      a: 'Check-in mulai pukul 14.00 dan check-out paling lambat pukul 12.00. Bila Anda tiba lebih awal, kami titipkan bagasi tanpa biaya sambil menunggu kamar siap.',
    },
    {
      q: 'Bagaimana cara memesan dan membayar?',
      a: 'Buat akun, pilih kamar dan tanggal, lalu bayar langsung di situs lewat Midtrans: transfer bank (virtual account), QRIS, GoPay, ShopeePay, atau kartu kredit/debit. Kamar ditahan selama 30 menit sejak Anda memesan.',
    },
    {
      q: 'Apa yang terjadi bila saya tidak menyelesaikan pembayaran?',
      a: 'Kamar otomatis dilepas setelah batas waktu pembayaran habis, tanpa biaya apa pun. Anda bisa memesan ulang selama kamar masih tersedia.',
    },
    {
      q: 'Apakah booking bisa dibatalkan atau diubah jadwalnya?',
      a: 'Pesanan yang belum dibayar dapat dibatalkan kapan saja dari halaman Booking saya. Untuk perubahan jadwal pada pesanan yang sudah dibayar, hubungi kami lewat WhatsApp paling lambat 3 hari sebelum check-in.',
    },
    {
      q: 'Apakah sarapan sudah termasuk?',
      a: 'Ya, sarapan untuk jumlah tamu sesuai pesanan sudah termasuk dan disajikan di Restoran Taman pukul 06.30–11.00. Permintaan khusus seperti vegetarian cukup tulis di kolom catatan saat memesan.',
    },
    {
      q: 'Apakah tersedia antar-jemput bandara?',
      a: 'Tersedia dari dan ke Bandara Ngurah Rai (sekitar 75 menit perjalanan). Tulis jam kedatangan Anda di catatan pesanan, tim kami akan menghubungi lewat WhatsApp untuk mengonfirmasi biayanya.',
    },
    {
      q: 'Apakah ramah untuk anak-anak?',
      a: 'Sangat. Kamar Keluarga memiliki dua tempat tidur besar, dan kami menyediakan tempat tidur bayi tanpa biaya (mohon minta saat memesan). Kolam memiliki area dangkal yang diawasi staf pada jam ramai.',
    },
  ],
}

export const leadForm = {
  label: 'Hubungi Kami',
  titleTop: 'Ada pertanyaan?',
  titleItalic: 'Tinggalkan pesan.',
  text: 'Ceritakan rencana menginap Anda: tanggal, jumlah tamu, atau acara khusus. Tim kami membalas lewat WhatsApp pada jam operasional.',
}

export const testimonials = {
  label: 'Ulasan Tamu',
  titleTop: 'Kata mereka yang',
  titleItalic: 'sudah menginap',
  rating: '4,9',
  count: '1.280',
  items: [
    {
      quote: 'Kami datang untuk tiga malam dan memperpanjang jadi lima. Kamarnya sepi, kolamnya bersih, dan stafnya hafal nama anak-anak kami di hari kedua.',
      name: 'Dewi Anggraini',
      meta: 'Jakarta · Kamar Keluarga',
    },
    {
      quote: 'Sarapan di dek Villa Air sambil melihat matahari naik adalah alasan saya akan kembali. Check-in cepat, tidak ada biaya tersembunyi.',
      name: 'Bagas Pratama',
      meta: 'Surabaya · Villa Air',
      featured: true,
    },
    {
      quote: 'Saya bekerja dari Suite Eksekutif selama seminggu. Wi-Fi stabil, meja kerjanya nyaman, dan sore harinya bisa langsung pijat di spa.',
      name: 'Maya Kusuma',
      meta: 'Bandung · Suite Eksekutif',
    },
  ],
}
