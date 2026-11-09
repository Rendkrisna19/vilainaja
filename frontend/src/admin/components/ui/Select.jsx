import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import { cx } from '../../../lib/cx'
import { Field } from './Field'
import f from './primitives.module.css'
import s from './Select.module.css'

const MAX_H = 264

/**
 * Dropdown kustom (pengganti <select>). Daftar dirender lewat portal dengan posisi fixed
 * sehingga tidak terpotong oleh modal atau tabel yang bisa di-scroll.
 */
export default function Select({
  label, value, onChange, options, placeholder = 'Pilih…', error, hint, required, compact, ariaLabel, className,
}) {
  const id = useId()
  const btnRef = useRef(null)
  const listRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState(null)

  const current = options.find((o) => String(o.value) === String(value))

  const openList = () => {
    const r = btnRef.current.getBoundingClientRect()
    const below = window.innerHeight - r.bottom
    const up = below < Math.min(MAX_H, options.length * 40 + 16) && r.top > below
    setPos({
      left: r.left,
      width: Math.max(r.width, 180),
      ...(up ? { bottom: window.innerHeight - r.top + 6 } : { top: r.bottom + 6 }),
      maxHeight: Math.min(MAX_H, (up ? r.top : below) - 16),
    })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    const onDown = (e) => {
      if (btnRef.current?.contains(e.target) || listRef.current?.contains(e.target)) return
      close()
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        close()
        btnRef.current?.focus()
      }
    }
    const onScroll = (e) => {
      if (!listRef.current?.contains(e.target)) close()
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey, true)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', close)
    listRef.current?.querySelector('[data-selected="true"], button')?.focus()
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey, true)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  const onListKey = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const items = [...listRef.current.querySelectorAll('button')]
    const i = items.indexOf(document.activeElement)
    items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus()
  }

  const choose = (v) => {
    onChange(v)
    setOpen(false)
    btnRef.current?.focus()
  }

  const root = document.querySelector('.admin') ?? document.body

  return (
    <Field label={label} error={error} hint={hint} required={required} htmlFor={id} className={className}>
      <button
        id={id}
        ref={btnRef}
        type="button"
        className={cx(f.input, s.trigger, compact && s.compact, error && f.invalid)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openList())}
      >
        <span className={cx(s.value, !current && s.placeholder)}>{current ? current.label : placeholder}</span>
        <ChevronDown size={16} className={cx(s.chev, open && s.chevOpen)} />
      </button>

      {open &&
        createPortal(
          <ul ref={listRef} role="listbox" className={s.list} style={pos} onKeyDown={onListKey}>
            {options.map((o) => {
              const selected = String(o.value) === String(value)
              return (
                <li key={o.value} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    data-selected={selected}
                    className={cx(s.option, selected && s.selected)}
                    onClick={() => choose(o.value)}
                  >
                    <span>{o.label}</span>
                    {selected && <Check size={15} />}
                  </button>
                </li>
              )
            })}
          </ul>,
          root,
        )}
    </Field>
  )
}
