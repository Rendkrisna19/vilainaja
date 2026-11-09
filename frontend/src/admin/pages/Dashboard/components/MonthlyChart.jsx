import Skeleton from '../../../components/ui/Skeleton'
import { formatCompactRupiah, formatRupiah } from '../../../../lib/format'
import s from './Dashboard.module.css'

/** Diagram batang ringan (tanpa library): jumlah booking per bulan, pendapatan di bawah label bulan. */
export default function MonthlyChart({ data = [], loading }) {
  const max = Math.max(1, ...data.map((d) => d.bookings))

  if (loading) {
    return (
      <div className={s.chart}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={s.col}>
            <Skeleton width={20} height={12} />
            <Skeleton width="100%" height={40 + ((i * 37) % 110)} radius={10} />
            <Skeleton width={30} height={12} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={s.chart} role="img" aria-label="Diagram jumlah booking enam bulan terakhir">
      {data.map((d) => (
        <div key={d.month} className={s.col} title={`${d.bookings} booking · ${formatRupiah(d.revenue)}`}>
          <span className={s.colValue}>{d.bookings}</span>
          <div className={s.barArea}>
            <span className={s.bar} style={{ height: `${Math.max(6, (d.bookings / max) * 100)}%` }} />
          </div>
          <span className={s.colLabel}>{d.label}</span>
          <span className={s.colSub}>{formatCompactRupiah(d.revenue)}</span>
        </div>
      ))}
    </div>
  )
}
