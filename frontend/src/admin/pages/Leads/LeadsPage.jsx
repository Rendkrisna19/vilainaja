import { useState } from 'react'
import { Plus, UserPlus } from 'lucide-react'
import { leads } from '../../api/resources'
import { formatDateTime } from '../../../lib/format'
import { LEAD_SOURCE, LEAD_STATUS, toOptions } from '../../lib/constants'
import { useTableState } from '../../hooks/useTableState'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge, { StatusBadge } from '../../components/ui/Badge'
import SearchInput from '../../components/ui/SearchInput'
import Select from '../../components/ui/Select'
import DataTable from '../../components/ui/DataTable'
import Pagination from '../../components/ui/Pagination'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import RowActions from '../../components/ui/RowActions'
import { Toolbar, ToolbarGrow } from '../../components/ui/Toolbar'
import LeadFormModal from './components/LeadFormModal'
import s from './LeadsPage.module.css'

const STATUS_FILTER = [{ value: '', label: 'Semua status' }, ...toOptions(LEAD_STATUS)]

export default function LeadsPage() {
  const table = useTableState({ status: '' })
  const { data, isLoading, isFetching, isError, error } = leads.useList(table.params)
  const remove = leads.useDelete()

  const [form, setForm] = useState({ open: false, lead: null })
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
      header: 'Nama',
      skeleton: '70%',
      render: (l) => (
        <div className={s.stack}>
          <p className={s.strong}>{l.name}</p>
          <p className={s.sub}>{l.phone || l.email || '—'}</p>
        </div>
      ),
    },
    { key: 'message', header: 'Pesan', render: (l) => <p className={s.message}>{l.message || '—'}</p> },
    { key: 'source', header: 'Sumber', render: (l) => <Badge tone="gray">{LEAD_SOURCE[l.source] ?? l.source}</Badge> },
    { key: 'status', header: 'Status', skeleton: 90, render: (l) => <StatusBadge map={LEAD_STATUS} status={l.status} /> },
    { key: 'created', header: 'Masuk', skeleton: 90, render: (l) => <span className={s.sub}>{formatDateTime(l.created_at)}</span> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: 150,
      skeleton: 110,
      render: (l) => (
        <RowActions label={`lead ${l.name}`} onEdit={() => setForm({ open: true, lead: l })} onDelete={() => setToDelete(l)} />
      ),
    },
  ]

  const filtered = Boolean(table.search || table.filters.status)

  return (
    <>
      <PageHeader
        title="Calon tamu"
        accent="(leads)"
        description="Pantau prospek yang menghubungi lewat website, WhatsApp, atau media sosial."
        actions={<Button icon={Plus} onClick={() => setForm({ open: true, lead: null })}>Tambah lead</Button>}
      />

      <Card flush>
        <Toolbar>
          <ToolbarGrow>
            <SearchInput onChange={table.setSearch} placeholder="Cari nama, telepon, email, atau pesan…" label="Cari lead" />
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
              icon: UserPlus,
              title: filtered ? 'Lead tidak ditemukan' : 'Belum ada lead',
              text: filtered ? 'Coba ubah kata kunci atau filter status.' : 'Prospek yang masuk akan tampil di sini.',
              action: !filtered && <Button icon={Plus} onClick={() => setForm({ open: true, lead: null })}>Tambah lead</Button>,
            }}
          />
        )}

        <Pagination meta={data?.meta} onPage={table.setPage} loading={isFetching} />
      </Card>

      <LeadFormModal open={form.open} lead={form.lead} onClose={() => setForm({ open: false, lead: null })} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Hapus lead?"
        message={toDelete && `Data "${toDelete.name}" akan dihapus permanen.`}
        loading={remove.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}
