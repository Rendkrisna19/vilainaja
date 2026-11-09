import Skeleton from '../../../components/ui/Skeleton'
import EmptyState from '../../../components/ui/EmptyState'
import s from './Dashboard.module.css'

/** Daftar baris ringkas: [lead] judul + subjudul … [end]. Dipakai untuk booking & lead terbaru. */
export default function RowList({ items = [], loading, rows = 5, empty }) {
  if (loading) {
    return (
      <ul className={s.rows}>
        {Array.from({ length: rows }, (_, i) => (
          <li key={i} className={s.row}>
            <Skeleton width={40} height={40} radius={12} />
            <div className={s.rowMain}>
              <Skeleton width="55%" height={13} />
              <Skeleton width="80%" height={11} style={{ marginTop: 7 }} />
            </div>
            <Skeleton width={64} height={22} radius={999} />
          </li>
        ))}
      </ul>
    )
  }

  if (!items.length) return <EmptyState {...empty} />

  return (
    <ul className={s.rows}>
      {items.map((it) => (
        <li key={it.key} className={s.row}>
          <span className={s.rowLead}>{it.lead}</span>
          <div className={s.rowMain}>
            <p className={s.rowTitle}>{it.title}</p>
            <p className={s.rowSub}>{it.sub}</p>
          </div>
          <div className={s.rowEnd}>{it.end}</div>
        </li>
      ))}
    </ul>
  )
}
