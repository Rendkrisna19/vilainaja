import Skeleton from '../../../components/ui/Skeleton'
import s from './Dashboard.module.css'

export default function StatCard({ icon: Icon, label, value, hint, loading }) {
  return (
    <div className={s.stat}>
      <span className={s.statIcon}><Icon size={20} /></span>
      <div className={s.statBody}>
        <p className={s.statLabel}>{label}</p>
        {loading ? (
          <>
            <Skeleton width="60%" height={30} style={{ margin: '6px 0 8px' }} />
            <Skeleton width="80%" height={12} />
          </>
        ) : (
          <>
            <p className={s.statValue}>{value}</p>
            <p className={s.statHint}>{hint}</p>
          </>
        )}
      </div>
    </div>
  )
}
