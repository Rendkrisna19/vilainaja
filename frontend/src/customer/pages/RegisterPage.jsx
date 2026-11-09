import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Mail, Phone, User } from 'lucide-react'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import AuthShell from '../components/AuthShell'
import GoogleButton from '../components/GoogleButton'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Field'
import s from './AuthPages.module.css'

const safeNext = (v) => (v && v.startsWith('/') && !v.startsWith('//') ? v : '/akun/booking')

export default function RegisterPage() {
  const { status, register } = useCustomerAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const next = safeNext(params.get('next'))
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', password_confirmation: '' })
  const [agree, setAgree] = useState(false)
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

    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: 'Konfirmasi password tidak sama.' })
      return
    }
    if (!agree) {
      setError('Centang persetujuan syarat & ketentuan untuk melanjutkan.')
      return
    }

    setLoading(true)
    try {
      await register({ ...form, name: form.name.trim(), email: form.email.trim() })
      navigate(next, { replace: true })
    } catch (err) {
      setErrors(err.errors || {})
      if (!err.errors || err.status !== 422) setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Buat"
      accent="akun baru"
      subtitle="Lengkapi data berikut agar proses pemesanan dan konfirmasi lebih cepat."
      footer={<>Sudah punya akun? <Link to={`/masuk?next=${encodeURIComponent(next)}`}>Masuk</Link></>}
    >
      {error && <Alert tone="error">{error}</Alert>}

      <form className={s.form} onSubmit={submit} noValidate>
        <Input label="Nama lengkap" icon={User} autoComplete="name" placeholder="Sesuai identitas" value={form.name} onChange={set('name')} error={errors.name} required />
        <Input label="Nomor WhatsApp" icon={Phone} type="tel" inputMode="tel" autoComplete="tel" placeholder="0812 3456 7890" hint="Dipakai untuk konfirmasi pesanan." value={form.phone} onChange={set('phone')} error={errors.phone} required />
        <Input label="Email" type="email" icon={Mail} autoComplete="email" placeholder="nama@email.com" value={form.email} onChange={set('email')} error={errors.email} required />
        <div className={s.two}>
          <Input label="Password" type="password" icon={Lock} autoComplete="new-password" placeholder="Min. 8 karakter" value={form.password} onChange={set('password')} error={errors.password} required />
          <Input label="Ulangi password" type="password" icon={Lock} autoComplete="new-password" placeholder="Ulangi password" value={form.password_confirmation} onChange={set('password_confirmation')} error={errors.password_confirmation} required />
        </div>

        <label className={s.check}>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>Saya menyetujui syarat &amp; ketentuan serta kebijakan privasi.</span>
        </label>

        <Button type="submit" block loading={loading}>Daftar</Button>
      </form>

      <div className={s.or}><span>atau</span></div>
      <GoogleButton label="Daftar dengan Google" onDone={() => navigate(next, { replace: true })} onError={setError} />
    </AuthShell>
  )
}
