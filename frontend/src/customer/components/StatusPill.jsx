import { BOOKING_STATUS } from '../lib/booking'
import s from './StatusPill.module.css'

export default function StatusPill({ status }) {
  const item = BOOKING_STATUS[status] ?? { label: status, tone: 'gray' }
  return <span className={`${s.pill} ${s[item.tone]}`}>{item.label}</span>
}
