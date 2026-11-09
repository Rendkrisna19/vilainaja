import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cx } from '../../../lib/cx'
import s from './ui.module.css'

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
      <div className={s.wrap}>
        {Icon && <Icon size={17} className={s.icon} />}
        <input
          id={id}
          type={isPassword && show ? 'text' : type}
          className={cx(s.input, Icon && s.withIcon, error && s.invalid)}
          aria-invalid={!!error}
          style={isPassword ? { paddingRight: 48 } : undefined}
          {...props}
        />
        {isPassword && (
          <button type="button" className={s.eye} onClick={() => setShow((v) => !v)} aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}>
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
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
