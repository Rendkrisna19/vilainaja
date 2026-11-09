import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, Mail } from 'lucide-react'
import { APP_NAME } from '../../../lib/env'
import Logo from '../../../lib/Logo'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import ThemeToggle from '../../components/layout/ThemeToggle'
import { Input } from '../../components/ui/Field'
import Button from '../../components/ui/Button'
import s from './LoginPage.module.css'

const HERO = 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1400&q=75'

export default function LoginPage() {
  const { status, login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  if (status === 'authed') return <Navigate to={location.state?.from || '/admin/dashboard'} replace />

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await login(form.email.trim(), form.password)
      toast.success('Selamat datang kembali!')
      navigate(location.state?.from || '/admin/dashboard', { replace: true })
    } catch (err) {
      setErrors(err.errors || {})
      toast.error(err.status === 422 ? 'Email atau password salah.' : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={s.page}>
      <aside className={s.visual} style={{ backgroundImage: `url(${HERO})` }}>
        <Logo tone="light" height={80} alt={APP_NAME} />
        <p className={s.quote}>
          Kelola kamar, booking, dan tamu <em>dalam satu tempat.</em>
        </p>
      </aside>

      <main className={s.formSide}>
        <div className={s.top}>
          <Link to="/" className={s.back}><ArrowLeft size={16} /> Kembali ke website</Link>
          <ThemeToggle />
        </div>

        <form className={s.card} onSubmit={submit} noValidate>
          <h1 className={s.title}>Masuk ke <em>panel admin</em></h1>
          <p className={s.sub}>Gunakan akun admin untuk mengelola {APP_NAME}.</p>

          <div className={s.fields}>
            <Input
              label="Email"
              type="email"
              icon={Mail}
              autoComplete="username"
              placeholder="admin@gmail.com"
              value={form.email}
              onChange={set('email')}
              error={errors.email}
              required
            />
            <Input
              label="Password"
              type="password"
              icon={Lock}
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              error={errors.password}
              required
            />
          </div>

          <Button type="submit" loading={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'Memproses…' : 'Masuk'}
          </Button>
        </form>
      </main>
    </div>
  )
}
