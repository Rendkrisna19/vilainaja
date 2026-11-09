import Skeleton from '../../../components/ui/Skeleton'
import { BOOKING_STATUS } from '../../../lib/constants'
import s from './Dashboard.module.css'

export default function StatusBreakdown({ counts = {}, loading }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1

  return (
    <ul className={s.breakdown}>
      {Object.entries(BOOKING_STATUS).map(([key, { label, tone }]) => (
        <li key={key}>
          <div className={s.breakTop}>
            <span>{label}</span>
            {loading ? <Skeleton width={28} height={12} /> : <strong>{counts[key] ?? 0}</strong>}
          </div>
          <div className={s.breakTrack}>
            {!loading && <span className={`${s.breakFill} ${s[tone]}`} style={{ width: `${((counts[key] ?? 0) / total) * 100}%` }} />}
          </div>
        </li>
      ))}
    </ul>
  )
}
