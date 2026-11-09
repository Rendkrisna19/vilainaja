import { useEffect, useState } from 'react'

export const BOOKING_STATUS = {
  pending: { label: 'Menunggu pembayaran', tone: 'amber' },
  confirmed: { label: 'Dikonfirmasi', tone: 'green' },
  checked_in: { label: 'Sedang menginap', tone: 'blue' },
  completed: { label: 'Selesai', tone: 'gray' },
  cancelled: { label: 'Dibatalkan', tone: 'red' },
}

const pad = (n) => String(n).padStart(2, '0')
export const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const parseISO = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const addDays = (iso, n) => {
  const d = parseISO(iso)
  d.setDate(d.getDate() + n)
  return isoDate(d)
}
export const nightsBetween = (a, b) => Math.max(0, Math.round((parseISO(b) - parseISO(a)) / 86400000))

export const fmtDate = (iso) =>
  parseISO(iso).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

// Format pendek untuk pemicu kalender: "9 Nov"
export const fmtShort = (iso) =>
  parseISO(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

export const newKey = () =>
  (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`).slice(0, 64)

/**
 * Hitung mundur berdasarkan sisa detik dari SERVER (bukan jam perangkat), sehingga akurat
 * walau jam perangkat salah. `anchor` = kapan nilai itu diterima (dataUpdatedAt react-query).
 */
export function useCountdown(secondsLeft, anchor) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (secondsLeft == null) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [secondsLeft])

  if (secondsLeft == null) return null
  return Math.max(0, Math.round(secondsLeft - (now - anchor) / 1000))
}

export const fmtClock = (total) => `${pad(Math.floor(total / 60))}:${pad(total % 60)}`
