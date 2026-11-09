import { cx } from './cx'
import s from './Logo.module.css'

/**
 * Logo vilainaja.
 *  - tone="dark"  : untuk latar terang (teks cokelat tua)
 *  - tone="light" : untuk latar gelap / foto (teks krem)
 *  - tone="auto"  : mengikuti tema admin (terang/gelap) — dipakai di sidebar admin
 *  - mark         : hanya lambang lengkung, untuk ruang sempit
 */
export default function Logo({ tone = 'dark', height = 40, mark = false, alt = 'vilainaja', className }) {
  if (mark) {
    return <img src="/mark.png" alt={alt} style={{ height, width: height }} className={cx(s.img, className)} decoding="async" />
  }

  if (tone === 'auto') {
    return (
      <span className={cx(s.auto, className)} style={{ height }}>
        <img src="/logo.png" alt={alt} style={{ height }} className={s.onLight} decoding="async" />
        <img src="/logo-light.png" alt="" aria-hidden="true" style={{ height }} className={s.onDark} decoding="async" />
      </span>
    )
  }

  const src = tone === 'light' ? '/logo-light.png' : '/logo.png'
  return <img src={src} alt={alt} style={{ height }} className={cx(s.img, className)} decoding="async" />
}
