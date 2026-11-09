import { brand, footer, navLinks } from '../../data/site'
import Logo from '../../../lib/Logo'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={`container ${styles.footer}`}>
      <div className={styles.top}>
        <a href="#" className={styles.brand} aria-label={brand}><Logo tone="dark" height={64} /></a>

        <div className={styles.cols}>
          <div>
            <h4>Alamat</h4>
            <p>{footer.address}</p>
            <p>{footer.hours}</p>
          </div>
          <div>
            <h4>Kontak</h4>
            <p><a href={`tel:${footer.phone.replace(/[^+\d]/g, '')}`}>{footer.phone}</a></p>
            <p><a href={`mailto:${footer.email}`}>{footer.email}</a></p>
          </div>
          <div>
            <h4>Jelajahi</h4>
            {navLinks.map((l) => (
              <p key={l.href}><a href={l.href}>{l.label}</a></p>
            ))}
          </div>
          <div>
            <h4>Ikuti</h4>
            {footer.social.map((s) => (
              <p key={s.label}><a href={s.href}>{s.label}</a></p>
            ))}
          </div>
        </div>
      </div>

      <p className={styles.copy}>© {new Date().getFullYear()} {brand}. Seluruh hak cipta dilindungi.</p>
    </footer>
  )
}
