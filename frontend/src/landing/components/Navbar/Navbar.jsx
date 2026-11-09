import { useState } from 'react'
import { Link } from 'react-router-dom'
import { brand, navLinks } from '../../data/site'
import { useCustomerAuth } from '../../../customer/context/CustomerAuthContext'
import { Menu, Close } from '../ui/Icons'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { status } = useCustomerAuth()
  const authed = status === 'authed'
  const account = authed ? { to: '/akun/booking', label: 'Booking saya' } : { to: '/masuk', label: 'Masuk' }

  return (
    <header className={styles.nav}>
      <a href="#" className={styles.brand}>{brand}</a>

      <nav className={`${styles.tab} ${styles.center}`} aria-label="Navigasi utama">
        {navLinks.map((l) => (
          <a key={l.href} href={l.href}>{l.label}</a>
        ))}
      </nav>

      <Link to={account.to} className={`${styles.tab} ${styles.right}`}>{account.label}</Link>

      <button
        className={styles.burger}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Tutup menu' : 'Buka menu'}
        aria-expanded={open}
      >
        {open ? <Close /> : <Menu />}
      </button>

      {open && (
        <div className={styles.sheet}>
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          <Link to={account.to} onClick={() => setOpen(false)}>{account.label}</Link>
          {!authed && <Link to="/daftar" onClick={() => setOpen(false)}>Daftar</Link>}
        </div>
      )}
    </header>
  )
}
