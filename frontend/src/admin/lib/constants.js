export const BOOKING_STATUS = {
  pending: { label: 'Menunggu', tone: 'amber' },
  confirmed: { label: 'Dikonfirmasi', tone: 'blue' },
  checked_in: { label: 'Check-in', tone: 'green' },
  completed: { label: 'Selesai', tone: 'gray' },
  cancelled: { label: 'Dibatalkan', tone: 'red' },
}

export const LEAD_STATUS = {
  new: { label: 'Baru', tone: 'blue' },
  contacted: { label: 'Dihubungi', tone: 'amber' },
  qualified: { label: 'Potensial', tone: 'green' },
  closed: { label: 'Selesai', tone: 'gray' },
}

export const LEAD_SOURCE = {
  website: 'Website',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  referral: 'Rekomendasi',
  other: 'Lainnya',
}

export const toOptions = (map, pick = (v) => (typeof v === 'string' ? v : v.label)) =>
  Object.entries(map).map(([value, v]) => ({ value, label: pick(v) }))

export const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', title: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/bookings', label: 'Data Booking', title: 'Data Booking', icon: 'bookings' },
  { to: '/admin/rooms', label: 'Kelola Kamar', title: 'Kelola Kamar', icon: 'rooms' },
  { to: '/admin/leads', label: 'Leads', title: 'Leads', icon: 'leads' },
  { to: '/admin/settings', label: 'Pengaturan', title: 'Pengaturan', icon: 'settings' },
]
