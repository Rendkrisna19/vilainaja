import { NavLink } from 'react-router-dom'
import { BedDouble, CalendarCheck, ExternalLink, LayoutDashboard, LogOut, Settings, UserPlus, X } from 'lucide-react'
import { APP_NAME } from '../../../lib/env'
import { initials } from '../../../lib/format'
import { NAV_ITEMS } from '../../lib/constants'
import { useAuth } from '../../context/AuthContext'
import s from './Sidebar.module.css'

const ICONS = {
  dashboard: LayoutDashboard,
  bookings: CalendarCheck,
  rooms: BedDouble,
  leads: UserPlus,
  settings: Settings,
}

export default function Sidebar({ open, collapsed, onClose }) {
  const { user, logout } = useAuth()

  return (
    <aside className={s.sidebar} data-open={open} data-collapsed={collapsed} aria-label="Menu admin">
      <div className={s.brandRow}>
        <NavLink to="/admin/dashboard" className={s.brand}>
          <span className={s.logo}>{APP_NAME}</span>
          <span className={s.badge}>Admin</span>
        </NavLink>
        <button className={s.closeBtn} onClick={onClose} aria-label="Tutup menu">
          <X size={18} />
        </button>
      </div>

      <nav className={s.nav}>
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon]
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              className={({ isActive }) => `${s.link} ${isActive ? s.active : ''}`}
            >
              <Icon size={19} />
              <span className={s.label}>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className={s.footer}>
        <a href="/" target="_blank" rel="noreferrer" className={s.link} title="Lihat website">
          <ExternalLink size={19} />
          <span className={s.label}>Lihat website</span>
        </a>

        <div className={s.user}>
          <span className={s.avatar}>{initials(user?.name)}</span>
          <span className={s.userInfo}>
            <strong>{user?.name}</strong>
            <small>{user?.email}</small>
          </span>
          <button className={s.logout} onClick={logout} aria-label="Keluar" title="Keluar">
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  )
}
