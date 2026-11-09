import s from './primitives.module.css'

/** Judul halaman: kata utama sans + kata aksen serif miring (sama seperti landing page). */
export default function PageHeader({ title, accent, description, actions }) {
  return (
    <div className={s.pageHeader}>
      <div>
        <h1 className={s.pageTitle}>
          {title} {accent && <em>{accent}</em>}
        </h1>
        {description && <p className={s.pageDesc}>{description}</p>}
      </div>
      {actions && <div className={s.pageActions}>{actions}</div>}
    </div>
  )
}
