import { useRef } from 'react'
import FieldPopover from './FieldPopover'
import styles from './Select.module.css'

export default function Select({ icon, label, value, options, onChange, align }) {
  const listRef = useRef(null)
  const current = options.find((o) => o.value === value)

  const onKeyDown = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const items = [...listRef.current.querySelectorAll('button')]
    const i = items.indexOf(document.activeElement)
    const next = e.key === 'ArrowDown' ? i + 1 : i - 1
    items[(next + items.length) % items.length]?.focus()
  }

  return (
    <FieldPopover icon={icon} label={label} value={current?.label} align={align}>
      {(close) => (
        <ul className={styles.list} role="listbox" ref={listRef} onKeyDown={onKeyDown}>
          {options.map((o) => (
            <li key={o.value} role="option" aria-selected={o.value === value}>
              <button
                type="button"
                className={o.value === value ? styles.selected : ''}
                autoFocus={o.value === value}
                onClick={() => {
                  onChange(o.value)
                  close()
                }}
              >
                <span>{o.label}</span>
                {o.value === value && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </FieldPopover>
  )
}
