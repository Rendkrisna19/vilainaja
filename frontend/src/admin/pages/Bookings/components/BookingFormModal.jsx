import { useEffect, useMemo } from 'react'
import { bookings, rooms } from '../../../api/resources'
import { useForm } from '../../../hooks/useForm'
import { BOOKING_STATUS, toOptions } from '../../../lib/constants'
import { formatRupiah } from '../../../../lib/format'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import Select from '../../../components/ui/Select'
import { Input, Textarea } from '../../../components/ui/Field'
import s from './BookingFormModal.module.css'

const iso = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const blank = () => {
  const today = new Date()
  const tomorrow = new Date(today.getTime() + 86400000)
  return {
    room_id: '', guest_name: '', guest_phone: '', guest_email: '',
    check_in: iso(today), check_out: iso(tomorrow),
    guests: 1, total_price: '', status: 'pending', notes: '',
  }
}

const STATUS_OPTIONS = toOptions(BOOKING_STATUS)

export default function BookingFormModal({ open, booking, onClose }) {
  const editing = Boolean(booking)
  const create = bookings.useCreate()
  const update = bookings.useUpdate()
  const saving = create.isPending || update.isPending
  const { values, setValues, errors, setErrors, set, bind } = useForm(blank())

  // Daftar kamar untuk pilihan (di-cache, tidak diambil ulang setiap modal dibuka).
  const { data: roomData } = rooms.useList({ per_page: 100 })
  const roomOptions = useMemo(
    () => (roomData?.data ?? []).map((r) => ({ value: String(r.id), label: `${r.name} — ${formatRupiah(r.price)}` })),
    [roomData],
  )

  useEffect(() => {
    if (!open) return
    setErrors({})
    setValues(
      booking
        ? {
            room_id: String(booking.room_id),
            guest_name: booking.guest_name,
            guest_phone: booking.guest_phone,
            guest_email: booking.guest_email ?? '',
            check_in: booking.check_in,
            check_out: booking.check_out,
            guests: booking.guests,
            total_price: booking.total_price,
            status: booking.status,
            notes: booking.notes ?? '',
          }
        : blank(),
    )
  }, [open, booking, setValues, setErrors])

  const submit = async (e) => {
    e.preventDefault()
    const body = {
      ...values,
      room_id: values.room_id ? Number(values.room_id) : null,
      guests: Number(values.guests) || 1,
      total_price: values.total_price === '' ? null : Number(values.total_price),
      guest_email: values.guest_email || null,
      notes: values.notes || null,
    }
    try {
      if (editing) await update.mutateAsync({ id: booking.id, ...body })
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
      title={editing ? `Ubah booking ${booking.code}` : 'Tambah booking'}
      description="Total harga dihitung otomatis dari harga kamar × jumlah malam bila dikosongkan."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>Batal</Button>
          <Button type="submit" form="booking-form" loading={saving}>{editing ? 'Simpan perubahan' : 'Tambah booking'}</Button>
        </>
      }
    >
      <form id="booking-form" onSubmit={submit} className={s.form} noValidate>
        <Select className={s.full} label="Kamar" required placeholder="Pilih kamar" options={roomOptions} value={values.room_id} onChange={set('room_id')} error={errors.room_id} />

        <Input label="Nama tamu" required placeholder="Nama lengkap" {...bind('guest_name')} />
        <Input label="Nomor telepon" required placeholder="0812…" inputMode="tel" {...bind('guest_phone')} />
        <Input className={s.full} label="Email (opsional)" type="email" placeholder="nama@email.com" {...bind('guest_email')} />

        <Input label="Check-in" type="date" required {...bind('check_in')} />
        <Input label="Check-out" type="date" required min={values.check_in} {...bind('check_out')} />

        <Input label="Jumlah tamu" type="number" min="1" required {...bind('guests')} />
        <Select label="Status" required options={STATUS_OPTIONS} value={values.status} onChange={set('status')} error={errors.status} />

        <Input className={s.full} label="Total harga (Rp)" type="number" min="0" placeholder="Otomatis" hint="Kosongkan untuk dihitung otomatis." {...bind('total_price')} />
        <Textarea className={s.full} label="Catatan" placeholder="Permintaan khusus tamu, jam kedatangan, dll." {...bind('notes')} />
      </form>
    </Modal>
  )
}
