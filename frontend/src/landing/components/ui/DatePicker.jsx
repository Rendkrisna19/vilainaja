import { useState } from 'react'
import FieldPopover from './FieldPopover'
import styles from './DatePicker.module.css'

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

const pad = (n) => String(n).padStart(2, '0')
export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const fromISO = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const addDays = (iso, n) => {
  const d = fromISO(iso)
  d.setDate(d.getDate() + n)
  return toISO(d)
}
const formatDate = (iso) =>
  fromISO(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

function Calendar({ value, min, onPick }) {
  const anchor = value ? fromISO(value) : fromISO(min)
  const [view, setView] = useState(new Date(anchor.getFullYear(), anchor.getMonth(), 1))

  const y = view.getFullYear()
  const m = view.getMonth()
  const offset = (view.getDay() + 6) % 7 // minggu dimulai Senin
  const total = new Date(y, m + 1, 0).getDate()
  const cells = [...Array(offset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)]

  const minDate = fromISO(min)
  const canPrev = new Date(y, m, 1) > new Date(minDate.getFullYear(), minDate.getMonth(), 1)
  const shift = (n) => setView(new Date(y, m + n, 1))
  const todayISO = toISO(new Date())

  return (
    <div className={styles.cal}>
      <div className={styles.head}>
        <button type="button" onClick={() => shift(-1)} disabled={!canPrev} aria-label="Bulan sebelumnya">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>
        </button>
        <strong>{MONTHS[m]} {y}</strong>
        <button type="button" onClick={() => shift(1)} aria-label="Bulan berikutnya">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
        </button>
      </div>

      <div className={styles.grid}>
        {DAYS.map((d) => (
          <span key={d} className={styles.dow}>{d}</span>
        ))}
        {cells.map((day, i) => {
          if (!day) return <span key={`e${i}`} />
          const iso = `${y}-${pad(m + 1)}-${pad(day)}`
          const disabled = iso < min
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              className={`${styles.day} ${iso === value ? styles.sel : ''} ${iso === todayISO ? styles.today : ''}`}
              onClick={() => onPick(iso)}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function DatePicker({ icon, label, value, min, onChange, placeholder, align }) {
  return (
    <FieldPopover
      icon={icon}
      label={label}
      value={value ? formatDate(value) : ''}
      placeholder={placeholder}
      align={align}
    >
      {(close) => (
        <Calendar
          value={value}
          min={min}
          onPick={(iso) => {
            onChange(iso)
            close()
          }}
        />
      )}
    </FieldPopover>
  )
}
