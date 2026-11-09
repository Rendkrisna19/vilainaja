import { useCallback, useMemo, useState } from 'react'

/**
 * State umum halaman tabel: halaman aktif, pencarian, dan filter.
 * Setiap perubahan pencarian/filter otomatis kembali ke halaman 1.
 */
export function useTableState(initialFilters = {}, perPage = 10) {
  const [page, setPage] = useState(1)
  const [search, setSearchValue] = useState('')
  const [filters, setFilters] = useState(initialFilters)

  const setSearch = useCallback((v) => {
    setSearchValue(v)
    setPage(1)
  }, [])

  const setFilter = useCallback((key, value) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
  }, [])

  const params = useMemo(
    () => ({ page, per_page: perPage, search, ...filters }),
    [page, perPage, search, filters],
  )

  return { page, setPage, search, setSearch, filters, setFilter, params }
}
