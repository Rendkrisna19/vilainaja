import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Mail } from 'lucide-react'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import AuthShell from '../components/AuthShell'
import GoogleButton from '../components/GoogleButton'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Field'
import s from './AuthPages.module.css'

// Hanya izinkan redirect ke path internal (mencegah open redirect).
const safeNext = (v) => (v && v.startsWith('/') && !v.startsWith('//') ? v : '/akun/booking')

export default function LoginPage() {
  const { status, login } = useCustomerAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const next = safeNext(params.get('next'))
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (status === 'authed') return <Navigate to={next} replace />

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (loading) return
    setErrors({})
    setError('')
    setLoading(true)
    try {
      await login(form.email.trim(), form.password)
      navigate(next, { replace: true })
    } catch (err) {
      setErrors(err.errors || {})
      if (!err.errors?.email) setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Masuk ke"
      accent="akun Anda"
      subtitle="Masuk untuk memesan kamar dan melihat riwayat booking."
      footer={<>Belum punya akun? <Link to={`/daftar?next=${encodeURIComponent(next)}`}>Daftar sekarang</Link></>}
    >
      {error && <Alert tone="error">{error}</Alert>}

      <form className={s.form} onSubmit={submit} noValidate>
        <Input label="Email" type="email" icon={Mail} autoComplete="username" placeholder="nama@email.com" value={form.email} onChange={set('email')} error={errors.email} required />
        <Input label="Password" type="password" icon={Lock} autoComplete="current-password" placeholder="••••••••" value={form.password} onChange={set('password')} error={errors.password} required />
        <Button type="submit" block loading={loading}>Masuk</Button>
      </form>

      <GoogleButton onDone={() => navigate(next, { replace: true })} onError={setError} />
    </AuthShell>
  )
}
