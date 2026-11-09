import { useState } from 'react'
import { BedDouble, Plus } from 'lucide-react'
import { rooms } from '../../api/resources'
import { formatRupiah } from '../../../lib/format'
import { useTableState } from '../../hooks/useTableState'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import SearchInput from '../../components/ui/SearchInput'
import Select from '../../components/ui/Select'
import DataTable from '../../components/ui/DataTable'
import Pagination from '../../components/ui/Pagination'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import RowActions from '../../components/ui/RowActions'
import { Toolbar, ToolbarGrow } from '../../components/ui/Toolbar'
import RoomFormModal from './components/RoomFormModal'
import s from './RoomsPage.module.css'

const ACTIVE_OPTIONS = [
  { value: '', label: 'Semua status' },
  { value: '1', label: 'Aktif' },
  { value: '0', label: 'Nonaktif' },
]

export default function RoomsPage() {
  const table = useTableState({ active: '' })
  const { data, isLoading, isFetching, isError, error } = rooms.useList(table.params)
  const remove = rooms.useDelete()

  const [form, setForm] = useState({ open: false, room: null })
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
    {
      key: 'name',
      header: 'Kamar',
      skeleton: '75%',
      render: (r) => (
        <div className={s.room}>
          {r.image_url ? <img src={r.image_url} alt="" loading="lazy" /> : <span className={s.noImg}><BedDouble size={18} /></span>}
          <div>
            <p className={s.name}>{r.name}</p>
            {r.tag && <p className={s.tag}>{r.tag}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'detail',
      header: 'Detail',
      render: (r) => <span className={s.muted}>{r.size} m² · {r.capacity} tamu · {r.bed || '—'}</span>,
    },
    { key: 'price', header: 'Harga / malam', render: (r) => <strong className={s.price}>{formatRupiah(r.price)}</strong> },
    {
      key: 'stock',
      header: 'Unit (malam ini)',
      width: 150,
      render: (r) => (
        <span className={s.muted}>
          <strong className={s.price}>{r.units_left ?? '—'}</strong> sisa · {r.booked_units ?? 0} terisi dari {r.stock}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      skeleton: 70,
      render: (r) => <Badge tone={r.is_active ? 'green' : 'gray'}>{r.is_active ? 'Aktif' : 'Nonaktif'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: 150,
      skeleton: 110,
      render: (r) => (
        <RowActions label={r.name} onEdit={() => setForm({ open: true, room: r })} onDelete={() => setToDelete(r)} />
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Kelola"
        accent="kamar"
        description="Atur tipe kamar, harga, jumlah unit, dan ketersediaannya."
        actions={<Button icon={Plus} onClick={() => setForm({ open: true, room: null })}>Tambah kamar</Button>}
      />

      <Card flush>
        <Toolbar>
          <ToolbarGrow>
            <SearchInput onChange={table.setSearch} placeholder="Cari nama atau tempat tidur…" label="Cari kamar" />
          </ToolbarGrow>
          <Select
            compact
            ariaLabel="Filter status"
            value={table.filters.active}
            onChange={(v) => table.setFilter('active', v)}
            options={ACTIVE_OPTIONS}
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
            skeletonRows={table.params.per_page > 6 ? 6 : table.params.per_page}
            empty={{
              icon: BedDouble,
              title: table.search || table.filters.active ? 'Kamar tidak ditemukan' : 'Belum ada kamar',
              text: table.search || table.filters.active ? 'Coba ubah kata kunci atau filter.' : 'Tambahkan tipe kamar pertama Anda.',
              action: !table.search && !table.filters.active && (
                <Button icon={Plus} onClick={() => setForm({ open: true, room: null })}>Tambah kamar</Button>
              ),
            }}
          />
        )}

        <Pagination meta={data?.meta} onPage={table.setPage} loading={isFetching} />
      </Card>

      <RoomFormModal open={form.open} room={form.room} onClose={() => setForm({ open: false, room: null })} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Hapus kamar?"
        message={toDelete && `Kamar "${toDelete.name}" akan dihapus permanen. Kamar yang sudah memiliki booking tidak dapat dihapus — nonaktifkan saja.`}
        loading={remove.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}
