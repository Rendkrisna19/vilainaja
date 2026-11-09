import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import styles from './Toast.module.css'

const ToastContext = createContext(null)

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info }

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => setItems((list) => list.filter((t) => t.id !== id)), [])

  const push = useCallback(
    (type, message, duration = 4200) => {
      const id = ++idRef.current
      setItems((list) => [...list.slice(-3), { id, type, message }])
      if (duration) setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss],
  )

  const toast = useMemo(
    () => ({
      success: (m, d) => push('success', m, d),
      error: (m, d) => push('error', m, d ?? 6000),
      info: (m, d) => push('info', m, d),
      dismiss,
    }),
    [push, dismiss],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className={styles.viewport} aria-live="polite" aria-atomic="false">
        {items.map((t) => {
          const Icon = ICONS[t.type]
          return (
            <div key={t.id} className={`${styles.toast} ${styles[t.type]}`} role={t.type === 'error' ? 'alert' : 'status'}>
              <Icon size={18} className={styles.icon} />
              <p>{t.message}</p>
              <button onClick={() => dismiss(t.id)} aria-label="Tutup notifikasi">
                <X size={15} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast harus dipakai di dalam ToastProvider')
  return ctx
}
