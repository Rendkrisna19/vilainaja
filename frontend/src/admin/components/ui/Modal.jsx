import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cx } from '../../../lib/cx'
import s from './Modal.module.css'

export default function Modal({ open, title, description, onClose, children, footer, size = 'md', dismissible = true }) {
  const titleId = useId()
  const panelRef = useRef(null)
  // ref agar efek tidak dijalankan ulang (dan fokus tidak berpindah) setiap parent re-render
  const latest = useRef({ onClose, dismissible })
  latest.current = { onClose, dismissible }

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e) => {
      if (e.key === 'Escape' && latest.current.dismissible) latest.current.onClose()
    }
    document.addEventListener('keydown', onKey)

    // fokus ke kolom pertama agar bisa langsung mengetik
    const t = setTimeout(() => panelRef.current?.querySelector('input, textarea, button[aria-haspopup]')?.focus(), 30)

    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
      clearTimeout(t)
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className={s.backdrop}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && dismissible) onClose()
      }}
    >
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId} className={cx(s.panel, s[size])}>
        <header className={s.header}>
          <div>
            <h2 id={titleId} className={s.title}>{title}</h2>
            {description && <p className={s.desc}>{description}</p>}
          </div>
          <button className={s.close} onClick={onClose} disabled={!dismissible} aria-label="Tutup">
            <X size={18} />
          </button>
        </header>
        <div className={s.body}>{children}</div>
        {footer && <footer className={s.footer}>{footer}</footer>}
      </div>
    </div>,
    document.querySelector('.admin') ?? document.body,
  )
}
