import { useEffect, useMemo, useState } from 'react'
import { Check, ImagePlus, Loader2, Trash2, X } from 'lucide-react'
import { rooms, useDeleteRoomImage, useFacilities, useUploadRoomImages } from '../../../api/resources'
import { useForm } from '../../../hooks/useForm'
import { useToast } from '../../../components/ui/Toast'
import { compressImage } from '../../../../lib/compressImage'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import { Input, Textarea, Toggle } from '../../../components/ui/Field'
import s from './RoomFormModal.module.css'

const EMPTY = {
  name: '', tag: '', description: '', image_url: '',
  size: '', capacity: 2, bed: '', price: '', stock: 1, is_active: true, facility_ids: [],
}
const MAX_FILES = 12

export default function RoomFormModal({ open, room, onClose }) {
  const editing = Boolean(room)
  const toast = useToast()
  const create = rooms.useCreate()
  const update = rooms.useUpdate()
  const upload = useUploadRoomImages()
  const removeImage = useDeleteRoomImage()
  const { data: facilities = [] } = useFacilities()
  const { values, setValues, setErrors, set, bind } = useForm(EMPTY)

  const [images, setImages] = useState([])     // foto yang sudah tersimpan di server
  const [pending, setPending] = useState([])   // { id, file, url } — sudah dikompres, belum diunggah
  const [compressing, setCompressing] = useState(0)
  const [saving, setSaving] = useState(false)

  // isi ulang form setiap modal dibuka
  useEffect(() => {
    if (!open) return
    setErrors({})
    setPending([])
    setImages(room?.images ?? [])
    setValues(
      room
        ? {
            ...EMPTY,
            ...room,
            tag: room.tag ?? '',
            description: room.description ?? '',
            image_url: room.image_url ?? '',
            bed: room.bed ?? '',
            facility_ids: room.facility_ids ?? room.facilities?.map((f) => f.id) ?? [],
          }
        : EMPTY,
    )
  }, [open, room, setValues, setErrors])

  // bersihkan URL pratinjau saat komponen tidak dipakai
  useEffect(() => () => pending.forEach((p) => URL.revokeObjectURL(p.url)), [pending])

  const toggleFacility = (id) =>
    set('facility_ids')(values.facility_ids.includes(id) ? values.facility_ids.filter((x) => x !== id) : [...values.facility_ids, id])

  const addFiles = async (fileList) => {
    const incoming = [...fileList]
    const room_left = MAX_FILES - images.length - pending.length
    if (incoming.length > room_left) {
      toast.error(`Maksimal ${MAX_FILES} foto per kamar. Sisa slot: ${Math.max(0, room_left)}.`)
      incoming.length = Math.max(0, room_left)
    }
    if (!incoming.length) return

    setCompressing(incoming.length)
    const done = []
    for (const f of incoming) {
      try {
        const small = await compressImage(f) // maks. 1600 px, WebP
        done.push({ id: crypto.randomUUID(), file: small, url: URL.createObjectURL(small), before: f.size, after: small.size })
      } catch (err) {
        toast.error(err.message)
      } finally {
        setCompressing((n) => n - 1)
      }
    }
    setPending((p) => [...p, ...done])
  }

  const dropPending = (id) =>
    setPending((p) => {
      const item = p.find((x) => x.id === id)
      if (item) URL.revokeObjectURL(item.url)
      return p.filter((x) => x.id !== id)
    })

  const deleteSaved = async (img) => {
    if (!window.confirm('Hapus foto ini dari kamar?')) return
    const res = await removeImage.mutateAsync(img.id)
    setImages(res.data.images)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (saving) return
    setSaving(true)

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
      const saved = editing
        ? await update.mutateAsync({ id: room.id, ...body })
        : await create.mutateAsync(body)
      const roomId = saved.data.id

      if (pending.length) {
        const res = await upload.mutateAsync({ roomId, files: pending.map((p) => p.file) })
        setImages(res.data.images)
        pending.forEach((p) => URL.revokeObjectURL(p.url))
        setPending([])
      }
      onClose()
    } catch (err) {
      setErrors(err.errors || {})
    } finally {
      setSaving(false)
    }
  }

  const facilityGroups = useMemo(() => facilities, [facilities])
  const busy = saving || create.isPending || update.isPending

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      dismissible={!busy}
      title={editing ? 'Ubah kamar' : 'Tambah kamar'}
      description="Data ini tampil di daftar tipe kamar dan dipakai saat membuat booking."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={busy}>Batal</Button>
          <Button type="submit" form="room-form" loading={busy} disabled={compressing > 0}>
            {editing ? 'Simpan perubahan' : 'Tambah kamar'}
          </Button>
        </>
      }
    >
      <form id="room-form" onSubmit={submit} className={s.form} noValidate>
        <Input className={s.full} label="Nama kamar" required placeholder="Contoh: Kamar Deluxe" {...bind('name')} />
        <Input label="Label (opsional)" placeholder="Contoh: Terpopuler" {...bind('tag')} />
        <Input label="Tempat tidur" placeholder="Contoh: 1 King" {...bind('bed')} />

        <Textarea className={s.full} label="Deskripsi" placeholder="Satu–dua kalimat tentang kamar ini." {...bind('description')} />

        {/* Foto */}
        <div className={s.full}>
          <p className={s.sectionLabel}>Foto kamar <span>· {images.length + pending.length}/{MAX_FILES}</span></p>
          <p className={s.hint}>Foto otomatis diperkecil dan dikonversi ke WebP sebelum diunggah. Anda bisa memilih beberapa foto sekaligus.</p>

          <div className={s.gallery}>
            {images.map((img) => (
              <figure key={img.id} className={s.thumb}>
                <img src={img.thumb_url} alt="" />
                <button type="button" className={s.thumbDel} onClick={() => deleteSaved(img)} aria-label="Hapus foto" disabled={removeImage.isPending}>
                  <Trash2 size={14} />
                </button>
              </figure>
            ))}
            {pending.map((p) => (
              <figure key={p.id} className={`${s.thumb} ${s.isNew}`}>
                <img src={p.url} alt="" />
                <span className={s.badge}>
                  {Math.round(p.before / 1024)} KB → {Math.round(p.after / 1024)} KB
                </span>
                <button type="button" className={s.thumbDel} onClick={() => dropPending(p.id)} aria-label="Batalkan foto">
                  <X size={14} />
                </button>
              </figure>
            ))}
            {compressing > 0 && (
              <div className={`${s.thumb} ${s.loading}`}>
                <Loader2 size={20} className={s.spin} />
                <small>Mengecilkan {compressing}…</small>
              </div>
            )}
            {images.length + pending.length < MAX_FILES && (
              <label className={s.add}>
                <ImagePlus size={22} />
                <span>Tambah foto</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={compressing > 0}
                  onChange={(e) => {
                    addFiles(e.target.files)
                    e.target.value = ''
                  }}
                />
              </label>
            )}
          </div>
        </div>

        {/* Fasilitas */}
        <div className={s.full}>
          <p className={s.sectionLabel}>Fasilitas <span>· {values.facility_ids.length} dipilih</span></p>
          <p className={s.hint}>Yang dicentang akan tampil di halaman kamar untuk tamu.</p>
          <div className={s.facilities}>
            {facilityGroups.map((f) => {
              const on = values.facility_ids.includes(f.id)
              return (
                <button
                  type="button"
                  key={f.id}
                  className={`${s.chip} ${on ? s.chipOn : ''}`}
                  onClick={() => toggleFacility(f.id)}
                  aria-pressed={on}
                >
                  <span className={s.box}>{on && <Check size={13} strokeWidth={3} />}</span>
                  {f.name}
                </button>
              )
            })}
          </div>
        </div>

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
