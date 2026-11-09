import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { NAV_ITEMS } from '../../lib/constants'
import ThemeToggle from './ThemeToggle'
import s from './Topbar.module.css'

export default function Topbar({ onMenu, menuOpen }) {
  const { pathname } = useLocation()
  const current = NAV_ITEMS.find((i) => pathname.startsWith(i.to))

  return (
    <header className={s.topbar}>
      <button className={s.menu} onClick={onMenu} aria-label="Buka/tutup menu" aria-expanded={menuOpen}>
        <Menu size={20} />
      </button>

      <p className={s.crumb}>
        <span>Admin</span>
        <span aria-hidden="true">/</span>
        <strong>{current?.title ?? 'Panel'}</strong>
      </p>

      <div className={s.right}>
        <ThemeToggle />
      </div>
    </header>
  )
}
