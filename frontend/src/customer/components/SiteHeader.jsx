import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { CalendarCheck, ChevronDown, LogOut } from 'lucide-react'
import { APP_NAME } from '../../lib/env'
import Logo from '../../lib/Logo'
import { initials } from '../../lib/format'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import s from './SiteHeader.module.css'

export default function SiteHeader() {
  const { user, status, logout } = useCustomerAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const down = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const key = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', down)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', down)
      document.removeEventListener('keydown', key)
    }
  }, [open])

  return (
    <header className={s.header}>
      <div className={s.inner}>
        <Link to="/" className={s.brand} aria-label={APP_NAME}><Logo tone="dark" height={44} /></Link>

        <nav className={s.nav} aria-label="Navigasi">
          <Link to="/#kamar">Kamar</Link>
          <Link to="/#faq">FAQ</Link>
          <Link to="/#kontak">Kontak</Link>
        </nav>

        <div className={s.right}>
          {status === 'authed' ? (
            <div className={s.menu} ref={ref}>
              <button className={s.user} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu">
                <span className={s.avatar}>{initials(user?.name)}</span>
                <span className={s.name}>{user?.name?.split(' ')[0]}</span>
                <ChevronDown size={15} />
              </button>
              {open && (
                <div className={s.pop} role="menu">
                  <div className={s.who}>
                    <strong>{user?.name}</strong>
                    <small>{user?.email}</small>
                  </div>
                  <NavLink to="/akun/booking" role="menuitem" onClick={() => setOpen(false)}><CalendarCheck size={16} /> Booking saya</NavLink>
                  <button role="menuitem" onClick={() => { setOpen(false); logout() }}><LogOut size={16} /> Keluar</button>
                </div>
              )}
            </div>
          ) : status === 'guest' ? (
            <>
              <Link to="/masuk" className={s.link}>Masuk</Link>
              <Link to="/daftar" className={s.cta}>Daftar</Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  )
}
