import { Outlet } from 'react-router-dom'
import { APP_NAME } from '../../lib/env'
import SiteHeader from '../components/SiteHeader'
import '../../landing/styles/global.css'
import s from './CustomerLayout.module.css'

export default function CustomerLayout() {
  return (
    <div className={s.shell}>
      <SiteHeader />
      <main className={s.main}>
        <Outlet />
      </main>
      <footer className={s.footer}>© {new Date().getFullYear()} {APP_NAME}. Seluruh hak cipta dilindungi.</footer>
    </div>
  )
}
