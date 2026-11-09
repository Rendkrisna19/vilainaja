import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'
import { useMediaQuery } from '../hooks/useMediaQuery'
import s from './AdminLayout.module.css'

const KEY = 'vila_admin_sidebar_collapsed'

export default function AdminLayout() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(KEY) === '1')
  const [drawer, setDrawer] = useState(false)
  const { pathname } = useLocation()

  // tutup drawer mobile setelah pindah halaman
  useEffect(() => setDrawer(false), [pathname])

  // Hamburger: di desktop menciutkan/melebarkan sidebar, di mobile membuka drawer
  const toggle = () => {
    if (isDesktop) {
      setCollapsed((c) => {
        localStorage.setItem(KEY, c ? '0' : '1')
        return !c
      })
    } else {
      setDrawer((d) => !d)
    }
  }

  const menuOpen = isDesktop ? !collapsed : drawer

  return (
    <div className={s.shell} data-collapsed={collapsed}>
      <Sidebar open={drawer} collapsed={collapsed} onClose={() => setDrawer(false)} />
      {drawer && <div className={s.backdrop} onClick={() => setDrawer(false)} aria-hidden="true" />}

      <div className={s.main}>
        <Topbar onMenu={toggle} menuOpen={menuOpen} />
        <main className={s.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
