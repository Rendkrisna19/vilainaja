import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { cx } from '../../../lib/cx'
import s from './primitives.module.css'

/** Kolom pencarian dengan debounce: onChange baru dipanggil setelah berhenti mengetik. */
export default function SearchInput({ onChange, placeholder = 'Cari…', delay = 350, label = 'Cari' }) {
  const [value, setValue] = useState('')
  // Nilai terakhir yang sudah dikirim ke parent. Mencegah onChange('') palsu saat mount
  // (efek dijalankan dua kali di StrictMode) yang akan mengembalikan paginasi ke halaman 1.
  const emitted = useRef('')

  useEffect(() => {
    const id = setTimeout(() => {
      const next = value.trim()
      if (next === emitted.current) return
      emitted.current = next
      onChange(next)
    }, delay)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay])

  return (
    <div className={s.inputWrap}>
      <Search size={16} className={s.inputIcon} />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className={cx(s.input, s.withIcon)}
        style={{ paddingRight: value ? 40 : undefined }}
      />
      {value && (
        <button
          type="button"
          className={cx(s.btn, s.ghost, s.sm, s.iconOnly, s.inputAction)}
          onClick={() => setValue('')}
          aria-label="Hapus pencarian"
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}
