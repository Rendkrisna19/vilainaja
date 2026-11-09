import { cx } from '../../../lib/cx'
import s from './primitives.module.css'

export default function Card({ title, action, flush = false, className, children }) {
  return (
    <section className={cx(s.card, className)}>
      {(title || action) && (
        <header className={s.cardHead}>
          {title && <h2 className={s.cardTitle}>{title}</h2>}
          {action}
        </header>
      )}
      <div className={flush ? s.cardFlush : s.cardBody}>{children}</div>
    </section>
  )
}
