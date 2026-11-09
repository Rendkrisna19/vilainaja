import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, fmtDate, fmtShort, isoDate, nightsBetween, parseISO } from '../lib/booking'
import s from './DateRangePicker.module.css'

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const DOW = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

const monthStart = (d) => new Date(d.getFullYear(), d.getMonth(), 1)
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1)

/** Satu bulan sebagai grid minggu (Senin di kiri). */
function MonthGrid({ month, checkIn, checkOut, hover, minDate, onPick, onHover }) {
  const first = monthStart(month)
  const offset = (first.getDay() + 6) % 7
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const cells = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  const today = isoDate(new Date())

  // Saat memilih tanggal keluar, sorot rentang sampai tanggal yang disorot kursor.
  const end = checkOut || (checkIn && hover && hover > checkIn ? hover : null)

  return (
    <div className={s.month}>
      <p className={s.monthTitle}>{MONTHS[first.getMonth()]} {first.getFullYear()}</p>
      <div className={s.grid}>
        {DOW.map((d) => <span key={d} className={s.dow}>{d}</span>)}
        {cells.map((day, i) => {
          if (!day) return <span key={`e${i}`} />
          const iso = isoDate(new Date(first.getFullYear(), first.getMonth(), day))
          const disabled = iso < minDate
          const isStart = iso === checkIn
          const isEnd = iso === end
          const inRange = checkIn && end && iso > checkIn && iso < end
          const cls = [
            s.day,
            disabled && s.disabled,
            iso === today && s.today,
            inRange && s.inRange,
            isStart && s.start,
            isEnd && s.end,
          ].filter(Boolean).join(' ')

          return (
            <button
              key={iso}
              type="button"
              className={cls}
              disabled={disabled}
              onClick={() => onPick(iso)}
              onMouseEnter={() => onHover(iso)}
              onMouseLeave={() => onHover(null)}
              aria-label={fmtDate(iso)}
              aria-pressed={isStart || isEnd}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Pemilih rentang tanggal: klik tanggal masuk, lalu tanggal keluar.
 * Tanggal sebelum `minDate` tidak bisa dipilih. Menampilkan dua bulan di layar lebar.
 */
export default function DateRangePicker({ checkIn, checkOut, onChange, minDate }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState('in') // 'in' = menunggu tanggal masuk, 'out' = menunggu tanggal keluar
  const [view, setView] = useState(() => monthStart(parseISO(checkIn || minDate)))
  const [hover, setHover] = useState(null)
  const ref = useRef(null)
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0

  useEffect(() => {
    if (!open) return
    const down = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    const key = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', down)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', down)
      document.removeEventListener('keydown', key)
    }
  }, [open])

  const openPicker = (nextStep) => {
    setStep(nextStep)
    if (checkIn) setView(monthStart(parseISO(checkIn)))
    setOpen(true)
  }

  const pick = (iso) => {
    if (step === 'in' || !checkIn || iso <= checkIn) {
      // tanggal masuk baru; tanggal keluar otomatis satu malam setelahnya
      onChange({ checkIn: iso, checkOut: addDays(iso, 1) })
      setStep('out')
      return
    }
    onChange({ checkIn, checkOut: iso })
    setOpen(false)
    setStep('in')
  }

  const reset = (e) => {
    e.stopPropagation()
    onChange({ checkIn: minDate, checkOut: addDays(minDate, 1) })
  }

  const second = useMemo(() => addMonths(view, 1), [view])
  const canPrev = monthStart(view) > monthStart(parseISO(minDate))

  return (
    <div className={s.root} ref={ref}>
      <div className={`${s.trigger} ${open ? s.active : ''}`} role="group" aria-label="Pilih tanggal menginap">
        <button type="button" className={s.part} onClick={() => openPicker('in')} aria-expanded={open && step === 'in'}>
          <span className={s.label}>Check-in</span>
          <span className={s.value}>{checkIn ? fmtShort(checkIn) : 'Pilih'}</span>
        </button>
        <span className={s.divider} aria-hidden="true" />
        <button type="button" className={s.part} onClick={() => openPicker('out')} aria-expanded={open && step === 'out'}>
          <span className={s.label}>Check-out</span>
          <span className={s.value}>{checkOut ? fmtShort(checkOut) : 'Pilih'}</span>
        </button>
        <span className={s.nightsBadge}>{nights} malam</span>
      </div>
      <div className={s.meta}>
        <span><CalendarDays size={14} /> {checkIn && checkOut ? `${fmtDate(checkIn)} – ${fmtDate(checkOut)}` : 'Belum ada tanggal dipilih'}</span>
        {checkIn && nights > 0 && (
          <button type="button" className={s.clear} onClick={reset}>Atur ulang</button>
        )}
      </div>

      {open && (
        <div className={s.pop} role="dialog" aria-label="Kalender">
          <div className={s.head}>
            <p>{step === 'in' ? 'Pilih tanggal check-in' : 'Pilih tanggal check-out'}</p>
            <div className={s.nav}>
              <button type="button" onClick={() => setView(addMonths(view, -1))} disabled={!canPrev} aria-label="Bulan sebelumnya"><ChevronLeft size={18} /></button>
              <button type="button" onClick={() => setView(addMonths(view, 1))} aria-label="Bulan berikutnya"><ChevronRight size={18} /></button>
            </div>
          </div>

          <div className={s.months}>
            <MonthGrid month={view} checkIn={checkIn} checkOut={checkOut} hover={hover} minDate={minDate} onPick={pick} onHover={setHover} />
            <div className={s.second}>
              <MonthGrid month={second} checkIn={checkIn} checkOut={checkOut} hover={hover} minDate={minDate} onPick={pick} onHover={setHover} />
            </div>
          </div>

          <div className={s.foot}>
            <span>
              {checkIn && checkOut ? `${fmtDate(checkIn)} → ${fmtDate(checkOut)}` : 'Klik tanggal masuk, lalu tanggal keluar'}
            </span>
            <button type="button" className={s.done} onClick={() => setOpen(false)} disabled={!checkIn || !checkOut}>
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
