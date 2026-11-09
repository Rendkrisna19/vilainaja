import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cx } from '../../../lib/cx'
import s from './primitives.module.css'

/** Pembungkus label + pesan error/petunjuk. `error` boleh string atau array. */
export function Field({ label, error, hint, required, htmlFor, children, className }) {
  const message = Array.isArray(error) ? error[0] : error
  return (
    <div className={cx(s.field, className)}>
      {label && (
        <label className={s.label} htmlFor={htmlFor}>
          {label}
          {required && <span className={s.req}>*</span>}
        </label>
      )}
      {children}
      {message ? <p className={s.error}>{message}</p> : hint ? <p className={s.hint}>{hint}</p> : null}
    </div>
  )
}

export function Input({ label, error, hint, required, className, icon: Icon, type = 'text', ...props }) {
  const id = useId()
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'

  return (
    <Field label={label} error={error} hint={hint} required={required} htmlFor={id} className={className}>
      <div className={s.inputWrap}>
        {Icon && <Icon size={16} className={s.inputIcon} />}
        <input
          id={id}
          type={isPassword && show ? 'text' : type}
          className={cx(s.input, Icon && s.withIcon, error && s.invalid)}
          aria-invalid={!!error}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className={cx(s.btn, s.ghost, s.sm, s.iconOnly, s.inputAction)}
            onClick={() => setShow((v) => !v)}
            aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </Field>
  )
}

export function Textarea({ label, error, hint, required, className, ...props }) {
  const id = useId()
  return (
    <Field label={label} error={error} hint={hint} required={required} htmlFor={id} className={className}>
      <textarea id={id} className={cx(s.input, error && s.invalid)} aria-invalid={!!error} {...props} />
    </Field>
  )
}

export function Toggle({ label, checked, onChange, hint }) {
  return (
    <Field hint={hint}>
      <label className={s.toggle}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className={s.track} />
        <span className={s.label}>{label}</span>
      </label>
    </Field>
  )
}
