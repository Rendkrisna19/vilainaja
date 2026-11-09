import { Loader2 } from 'lucide-react'
import { cx } from '../../../lib/cx'
import s from './primitives.module.css'

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconOnly = false,
  children,
  className,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      {...props}
      disabled={loading || props.disabled}
      className={cx(s.btn, s[variant], s[size], iconOnly && s.iconOnly, className)}
    >
      {loading ? <Loader2 size={16} className={s.spin} /> : Icon && <Icon size={size === 'sm' ? 15 : 17} />}
      {children}
    </button>
  )
}
