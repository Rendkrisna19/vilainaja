const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const compact = new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 })

export const formatRupiah = (n) => rupiah.format(Number(n) || 0)
export const formatCompactRupiah = (n) => `Rp${compact.format(Number(n) || 0)}`

const parse = (v) => {
  if (!v) return null
  // 'YYYY-MM-DD' diparse sebagai tanggal lokal agar tidak bergeser zona waktu
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const [y, m, d] = v.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  return new Date(v)
}

export const formatDate = (v) => {
  const d = parse(v)
  return d ? d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}

export const formatDateTime = (v) => {
  const d = parse(v)
  return d
    ? d.toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '—'
}

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
