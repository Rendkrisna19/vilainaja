import { cx } from '../../../lib/cx'
import s from './primitives.module.css'

export default function Badge({ tone = 'gray', children, className }) {
  return <span className={cx(s.badge, s[tone], className)}>{children}</span>
}

/** Badge dari peta status ({ key: { label, tone } }). */
export function StatusBadge({ map, status }) {
  const item = map[status] ?? { label: status, tone: 'gray' }
  return <Badge tone={item.tone}>{item.label}</Badge>
}
