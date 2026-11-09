import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { cx } from '../../../lib/cx'
import s from './ui.module.css'

const TONES = {
  error: { cls: s.aError, Icon: AlertCircle },
  success: { cls: s.aSuccess, Icon: CheckCircle2 },
  info: { cls: s.aInfo, Icon: Info },
  warn: { cls: s.aWarn, Icon: AlertCircle },
}

export default function Alert({ tone = 'info', children, className }) {
  const { cls, Icon } = TONES[tone]
  return (
    <div className={cx(s.alert, cls, className)} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon size={18} />
      <div>{children}</div>
    </div>
  )
}
