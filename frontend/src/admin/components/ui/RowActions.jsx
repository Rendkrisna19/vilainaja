import { Pencil, Trash2 } from 'lucide-react'
import Button from './Button'

/** Tombol aksi baris tabel: ubah dan hapus. */
export default function RowActions({ onEdit, onDelete, label = 'data' }) {
  return (
    <div style={{ display: 'inline-flex', gap: 6 }}>
      <Button variant="outline" size="sm" icon={Pencil} onClick={onEdit} aria-label={`Ubah ${label}`}>
        Ubah
      </Button>
      <Button variant="dangerGhost" size="sm" iconOnly icon={Trash2} onClick={onDelete} aria-label={`Hapus ${label}`} title="Hapus" />
    </div>
  )
}
