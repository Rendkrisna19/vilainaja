import { useEffect } from 'react'
import { rooms } from '../../../api/resources'
import { useForm } from '../../../hooks/useForm'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import { Input, Textarea, Toggle } from '../../../components/ui/Field'
import s from './RoomFormModal.module.css'

const EMPTY = {
  name: '', tag: '', description: '', image_url: '',
  size: '', capacity: 2, bed: '', price: '', stock: 1, is_active: true,
}

export default function RoomFormModal({ open, room, onClose }) {
  const editing = Boolean(room)
  const create = rooms.useCreate()
  const update = rooms.useUpdate()
  const { values, setValues, setErrors, set, bind } = useForm(EMPTY)
  const saving = create.isPending || update.isPending

  // isi ulang form setiap modal dibuka
  useEffect(() => {
    if (!open) return
    setErrors({})
    setValues(room ? { ...EMPTY, ...room, tag: room.tag ?? '', description: room.description ?? '', image_url: room.image_url ?? '', bed: room.bed ?? '' } : EMPTY)
  }, [open, room, setValues, setErrors])

  const submit = async (e) => {
    e.preventDefault()
    const body = {
      ...values,
      size: Number(values.size) || 0,
      capacity: Number(values.capacity) || 1,
      price: Number(values.price) || 0,
      stock: Number(values.stock) || 0,
      tag: values.tag || null,
      description: values.description || null,
      image_url: values.image_url || null,
      bed: values.bed || null,
    }
    try {
      if (editing) await update.mutateAsync({ id: room.id, ...body })
      else await create.mutateAsync(body)
      onClose()
    } catch (err) {
      setErrors(err.errors || {})
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      dismissible={!saving}
      title={editing ? 'Ubah kamar' : 'Tambah kamar'}
      description="Data ini tampil di daftar tipe kamar dan dipakai saat membuat booking."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>Batal</Button>
          <Button type="submit" form="room-form" loading={saving}>{editing ? 'Simpan perubahan' : 'Tambah kamar'}</Button>
        </>
      }
    >
      <form id="room-form" onSubmit={submit} className={s.form} noValidate>
        <Input className={s.full} label="Nama kamar" required placeholder="Contoh: Kamar Deluxe" {...bind('name')} />

        <Input label="Label (opsional)" placeholder="Contoh: Terpopuler" {...bind('tag')} />
        <Input label="Tempat tidur" placeholder="Contoh: 1 King" {...bind('bed')} />

        <div className={s.full}>
          <Input label="URL gambar" placeholder="https://images.unsplash.com/…" hint="Tempel tautan foto kamar." {...bind('image_url')} />
          {values.image_url && <img className={s.preview} src={values.image_url} alt="Pratinjau kamar" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />}
        </div>

        <Textarea className={s.full} label="Deskripsi" placeholder="Satu–dua kalimat tentang kamar ini." {...bind('description')} />

        <Input label="Harga per malam (Rp)" type="number" min="0" required {...bind('price')} />
        <Input label="Luas (m²)" type="number" min="0" required {...bind('size')} />
        <Input label="Kapasitas (tamu)" type="number" min="1" required {...bind('capacity')} />
        <Input label="Jumlah unit" type="number" min="0" required {...bind('stock')} />

        <div className={s.full}>
          <Toggle label={values.is_active ? 'Aktif — tampil dan bisa dipesan' : 'Nonaktif — disembunyikan'} checked={values.is_active} onChange={set('is_active')} />
        </div>
      </form>
    </Modal>
  )
}
