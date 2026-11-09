import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { APP_NAME } from '../../lib/env'
import Logo from '../../lib/Logo'
import '../../landing/styles/global.css'
import s from './AuthShell.module.css'

const HERO = 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=75'

/** Kerangka halaman masuk/daftar: foto di kiri, form di kanan. */
export default function AuthShell({ title, accent, subtitle, children, footer }) {
  return (
    <div className={s.page}>
      <aside className={s.visual} style={{ backgroundImage: `url(${HERO})` }}>
        <Link to="/" className={s.brand} aria-label={APP_NAME}><Logo tone="light" height={70} /></Link>
        <p className={s.quote}>
          Beristirahat <em>tanpa terburu-buru.</em>
        </p>
      </aside>

      <main className={s.side}>
        <Link to="/" className={s.back}><ArrowLeft size={16} /> Kembali ke beranda</Link>

        <div className={s.card}>
          <h1 className={s.title}>{title} <em>{accent}</em></h1>
          {subtitle && <p className={s.sub}>{subtitle}</p>}
          {children}
          {footer && <p className={s.footer}>{footer}</p>}
        </div>
      </main>
    </div>
  )
}
