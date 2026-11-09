import s from './primitives.module.css'

export function Toolbar({ children }) {
  return <div className={s.toolbar}>{children}</div>
}

export const ToolbarGrow = ({ children }) => <div className={s.toolbarGrow}>{children}</div>
export const ToolbarSpacer = () => <div className={s.toolbarSpacer} />
