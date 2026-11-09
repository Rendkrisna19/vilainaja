import { Inbox } from 'lucide-react'
import s from './primitives.module.css'

export default function EmptyState({ icon: Icon = Inbox, title, text, action }) {
  return (
    <div className={s.empty}>
      <span className={s.emptyIcon}>
        <Icon size={22} />
      </span>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  )
}
