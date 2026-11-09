import { Loader2 } from 'lucide-react'
import { cx } from '../../../lib/cx'
import s from './ui.module.css'

export default function Button({ variant = 'primary', size, block, loading, children, className, type = 'button', ...props }) {
  return (
    <button
      type={type}
      {...props}
      disabled={loading || props.disabled}
      className={cx(s.btn, s[variant], size === 'sm' && s.sm, block && s.block, className)}
    >
      {loading && <Loader2 size={17} className={s.spin} />}
      {children}
    </button>
  )
}
