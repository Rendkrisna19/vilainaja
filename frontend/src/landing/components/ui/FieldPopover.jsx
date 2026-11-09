import { useEffect, useRef, useState } from 'react'
import styles from './FieldPopover.module.css'

const Chevron = ({ open }) => (
  <svg
    className={`${styles.chev} ${open ? styles.chevOpen : ''}`}
    width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
)

/** Kolom pada bar pencarian: tombol (ikon + label + nilai) yang membuka popover kustom. */
export default function FieldPopover({ icon, label, value, placeholder, align = 'left', children }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className={`${styles.field} ${open ? styles.active : ''}`} ref={ref}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.icon}>{icon}</span>
        <span className={styles.text}>
          <span className={styles.label}>{label}</span>
          <span className={value ? styles.value : styles.placeholder}>{value || placeholder}</span>
        </span>
        <Chevron open={open} />
      </button>

      {open && (
        <div className={`${styles.pop} ${align === 'right' ? styles.right : ''}`}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}
