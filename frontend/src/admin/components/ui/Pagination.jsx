import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cx } from '../../../lib/cx'
import s from './Pagination.module.css'

// Contoh: [1, '…', 4, 5, 6, '…', 12]
const buildPages = (current, last) => {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)
  const set = new Set([1, last, current - 1, current, current + 1])
  if (current <= 3) [2, 3, 4].forEach((n) => set.add(n))
  if (current >= last - 2) [last - 1, last - 2, last - 3].forEach((n) => set.add(n))
  const sorted = [...set].filter((n) => n >= 1 && n <= last).sort((a, b) => a - b)
  return sorted.flatMap((n, i) => (i > 0 && n - sorted[i - 1] > 1 ? ['…', n] : [n]))
}

export default function Pagination({ meta, onPage, loading = false }) {
  if (!meta || meta.total === 0) return null
  const { current_page: page, last_page: last, total, from, to } = meta

  return (
    <nav className={s.wrap} aria-label="Navigasi halaman">
      <p className={s.info}>
        Menampilkan <strong>{from}–{to}</strong> dari <strong>{total}</strong> data
      </p>

      {last > 1 && (
        <div className={s.controls}>
          <button className={s.btn} onClick={() => onPage(page - 1)} disabled={page <= 1 || loading} aria-label="Halaman sebelumnya">
            <ChevronLeft size={16} />
          </button>

          <span className={s.compact}>Hal. {page} / {last}</span>

          <div className={s.pages}>
            {buildPages(page, last).map((p, i) =>
              p === '…' ? (
                <span key={`e${i}`} className={s.ellipsis}>…</span>
              ) : (
                <button
                  key={p}
                  className={cx(s.btn, p === page && s.active)}
                  onClick={() => onPage(p)}
                  disabled={loading}
                  aria-current={p === page ? 'page' : undefined}
                  aria-label={`Halaman ${p}`}
                >
                  {p}
                </button>
              ),
            )}
          </div>

          <button className={s.btn} onClick={() => onPage(page + 1)} disabled={page >= last || loading} aria-label="Halaman berikutnya">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </nav>
  )
}
