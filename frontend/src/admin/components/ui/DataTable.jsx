import { cx } from '../../../lib/cx'
import Skeleton from './Skeleton'
import EmptyState from './EmptyState'
import s from './DataTable.module.css'

/**
 * Tabel data responsif.
 *  - columns: [{ key, header, render?(row), align?, width?, skeleton?(width) }]
 *  - ≥768px tampil sebagai tabel; di bawahnya otomatis menjadi kartu bertumpuk (label dari header)
 *  - loading: tampilkan skeleton; refreshing: data lama diredupkan saat halaman baru dimuat
 */
export default function DataTable({
  columns, rows = [], rowKey = (r) => r.id, loading = false, refreshing = false, skeletonRows = 8, empty,
}) {
  const showEmpty = !loading && rows.length === 0

  return (
    <div className={cx(s.wrap, refreshing && s.refreshing)} aria-busy={loading || refreshing}>
      {showEmpty ? (
        <EmptyState {...empty} />
      ) : (
        <table className={s.table}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} style={{ width: c.width, textAlign: c.align }}>{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: skeletonRows }, (_, i) => (
                  <tr key={i}>
                    {columns.map((c) => (
                      <td key={c.key} data-label={c.header} className={cx(c.key === 'actions' && s.actions)} style={{ textAlign: c.align }}>
                        <Skeleton width={c.skeleton ?? '70%'} height={c.key === 'actions' ? 30 : 14} />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => (
                  <tr key={rowKey(row)}>
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        data-label={c.header}
                        className={cx(c.key === 'actions' && s.actions)}
                        style={{ textAlign: c.align }}
                      >
                        {c.render ? c.render(row) : row[c.key]}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
