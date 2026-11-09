import { useState } from 'react'
import { CalendarCheck, Plus } from 'lucide-react'
import { bookings } from '../../api/resources'
import { formatDate, formatRupiah } from '../../../lib/format'
import { BOOKING_STATUS, toOptions } from '../../lib/constants'
import { useTableState } from '../../hooks/useTableState'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/Badge'
import SearchInput from '../../components/ui/SearchInput'
import Select from '../../components/ui/Select'
import DataTable from '../../components/ui/DataTable'
import Pagination from '../../components/ui/Pagination'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import RowActions from '../../components/ui/RowActions'
import { Toolbar, ToolbarGrow } from '../../components/ui/Toolbar'
import BookingFormModal from './components/BookingFormModal'
import s from './BookingsPage.module.css'

const STATUS_FILTER = [{ value: '', label: 'Semua status' }, ...toOptions(BOOKING_STATUS)]

export default function BookingsPage() {
  const table = useTableState({ status: '' })
  const { data, isLoading, isFetching, isError, error } = bookings.useList(table.params)
  const remove = bookings.useDelete()

  const [form, setForm] = useState({ open: false, booking: null })
  const [toDelete, setToDelete] = useState(null)

  const confirmDelete = async () => {
    try {
      await remove.mutateAsync(toDelete.id)
      setToDelete(null)
    } catch {
      /* pesan error sudah tampil lewat toast */
    }
  }

  const columns = [
    { key: 'code', header: 'Kode', skeleton: 80, render: (b) => <span className={s.code}>{b.code}</span> },
    {
      key: 'guest',
      header: 'Tamu',
      skeleton: '70%',
      render: (b) => (
        <div className={s.stack}>
          <p className={s.strong}>{b.guest_name}</p>
          <p className={s.sub}>{b.guest_phone}</p>
        </div>
      ),
    },
    { key: 'room', header: 'Kamar', render: (b) => b.room?.name ?? '—' },
    {
      key: 'dates',
      header: 'Menginap',
      render: (b) => (
        <div className={s.stack}>
          <p>{formatDate(b.check_in)} → {formatDate(b.check_out)}</p>
          <p className={s.sub}>{b.nights} malam · {b.guests} tamu</p>
        </div>
      ),
    },
    { key: 'total', header: 'Total', render: (b) => <strong className={s.money}>{formatRupiah(b.total_price)}</strong> },
    { key: 'status', header: 'Status', skeleton: 90, render: (b) => <StatusBadge map={BOOKING_STATUS} status={b.status} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: 150,
      skeleton: 110,
      render: (b) => (
        <RowActions label={`booking ${b.code}`} onEdit={() => setForm({ open: true, booking: b })} onDelete={() => setToDelete(b)} />
      ),
    },
  ]

  const filtered = Boolean(table.search || table.filters.status)

  return (
    <>
      <PageHeader
        title="Data"
        accent="booking kamar"
        description="Semua reservasi tamu. Ubah status dari menunggu hingga selesai."
        actions={<Button icon={Plus} onClick={() => setForm({ open: true, booking: null })}>Tambah booking</Button>}
      />

      <Card flush>
        <Toolbar>
          <ToolbarGrow>
            <SearchInput onChange={table.setSearch} placeholder="Cari kode, nama, telepon, atau kamar…" label="Cari booking" />
          </ToolbarGrow>
          <Select
            compact
            ariaLabel="Filter status"
            value={table.filters.status}
            onChange={(v) => table.setFilter('status', v)}
            options={STATUS_FILTER}
          />
        </Toolbar>

        {isError ? (
          <p className={s.error}>Gagal memuat data: {error.message}</p>
        ) : (
          <DataTable
            columns={columns}
            rows={data?.data}
            loading={isLoading}
            refreshing={isFetching && !isLoading}
            skeletonRows={table.params.per_page}
            empty={{
              icon: CalendarCheck,
              title: filtered ? 'Booking tidak ditemukan' : 'Belum ada booking',
              text: filtered ? 'Coba ubah kata kunci atau filter status.' : 'Booking yang masuk akan tampil di sini.',
              action: !filtered && <Button icon={Plus} onClick={() => setForm({ open: true, booking: null })}>Tambah booking</Button>,
            }}
          />
        )}

        <Pagination meta={data?.meta} onPage={table.setPage} loading={isFetching} />
      </Card>

      <BookingFormModal open={form.open} booking={form.booking} onClose={() => setForm({ open: false, booking: null })} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Hapus booking?"
        message={toDelete && `Booking ${toDelete.code} atas nama ${toDelete.guest_name} akan dihapus permanen.`}
        loading={remove.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}
