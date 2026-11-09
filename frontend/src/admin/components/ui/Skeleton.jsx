import { cx } from '../../../lib/cx'
import s from './primitives.module.css'

export default function Skeleton({ width = '100%', height = 14, radius, className, style }) {
  return (
    <span
      aria-hidden="true"
      className={cx(s.skeleton, className)}
      style={{ width, height, borderRadius: radius, ...style }}
    />
  )
}
