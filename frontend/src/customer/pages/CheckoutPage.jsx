import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { BedDouble, Clock, Phone, ShieldCheck, Users, Ruler, User, Minus, Plus } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { formatRupiah } from '../../lib/format'
import { FacilityIcon } from '../../lib/facilityIcons'
import { api } from '../api/client'
import { usePublicRooms } from '../api/hooks'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { usePayment } from '../hooks/usePayment'
import { addDays, fmtDate, isoDate, newKey, nightsBetween } from '../lib/booking'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import { Field, Input, Textarea } from '../components/ui/Field'
import RoomGallery from '../components/RoomGallery'
import DateRangePicker from '../components/DateRangePicker'
import s from './CheckoutPage.module.css'

function CompleteProfile() {
  const { user, updateProfile } = useCustomerAuth()
  const [form, setForm] = useState({ name: user?.name ?? '', phone: user?.phone ?? '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      await updateProfile(form)
    } catch (err) {
      setErrors(err.errors || { phone: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className={s.card} onSubmit={save} noValidate>
      <h2 className={s.h2}>Lengkapi <em>data Anda</em></h2>
      <p className={s.muted}>Nomor WhatsApp diperlukan untuk konfirmasi pesanan.</p>
      <Input label="Nama lengkap" icon={User} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} required />
      <Input label="Nomor WhatsApp" icon={Phone} type="tel" placeholder="0812 3456 7890" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} error={errors.phone} required />
      <Button type="submit" loading={saving} block>Simpan &amp; lanjut</Button>
    </form>
  )
}

export default function CheckoutPage() {
  const { slug } = useParams()
  const [sp] = useSearchParams()
  const { user } = useCustomerAuth()
  const qc = useQueryClient()
  const { busy, run } = usePayment()

  const today = isoDate(new Date())
  const qIn = sp.get('check_in')
  const qOut = sp.get('check_out')
  const startIn = qIn && qIn >= today ? qIn : today
  const [dates, setDates] = useState({
    checkIn: startIn,
    checkOut: qOut && qOut > startIn ? qOut : addDays(startIn, 1),
  })
  const { checkIn, checkOut } = dates
  const [guests, setGuests] = useState(() => Number(sp.get('guests')) || 2)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState(null)

  const { data, isLoading, isError } = usePublicRooms({ check_in: checkIn, check_out: checkOut, guests }, { refetchInterval: 8_000 })
  const room = data?.data.find((r) => r.slug === slug)
  const nights = nightsBetween(checkIn, checkOut)
  const holdMinutes = data?.meta.hold_minutes ?? 30
  const total = (room?.price ?? 0) * nights

  // Satu kunci per "percobaan"; berganti saat pilihan berubah. Klik ulang memakai kunci yang sama → tidak ada booking ganda.
  const key = useRef(newKey())
  useEffect(() => {
    key.current = newKey()
  }, [room?.id, checkIn, checkOut, guests])

  const full = room && room.units_left < 1
  const tooMany = room && guests > room.capacity

  const submit = async (e) => {
    e.preventDefault()
    if (!room || full || tooMany || busy || nights < 1) return
    setError(null)

    try {
      await run(async () => {
        const res = await api('/customer/bookings', {
          method: 'POST',
          body: { room_id: room.id, check_in: checkIn, check_out: checkOut, guests, notes: notes || null, idempotency_key: key.current },
        })
        return { code: res.data.code, payment: res.payment }
      })
    } catch (err) {
      qc.invalidateQueries({ queryKey: ['public-rooms'] })
      setError({ message: err.message, code: err.code })
    }
  }

  if (isError || (!isLoading && !room)) {
    return (
      <div className={s.card}>
        <h1 className={s.h2}>Kamar <em>tidak ditemukan</em></h1>
        <p className={s.muted}>Kamar ini tidak tersedia atau sudah tidak aktif.</p>
        <Link to="/#kamar"><Button variant="outline">Lihat semua kamar</Button></Link>
      </div>
    )
  }

  const gallery = room?.images?.length ? room.images : room ? [{ url: room.image_url, thumb_url: room.image_url }] : []

  return (
    <div className={s.layout}>
      {/* ---------- Kiri: kamar ---------- */}
      <section className={s.main}>
        <p className={s.crumb}><Link to="/#kamar">Kamar</Link> / {room?.name ?? '…'}</p>
        <h1 className={s.title}>{room?.name ?? ' '}</h1>
        {room?.tag && <span className={s.tag}>{room.tag}</span>}

        {room ? (
          <RoomGallery images={gallery} alt={room.name} />
        ) : (
          <div className={s.skelImg} aria-busy="true" />
        )}

        {room && (
          <>
            <ul className={s.specs}>
              <li><Ruler size={16} /><span><strong>{room.size} m²</strong> luas</span></li>
              <li><Users size={16} /><span><strong>{room.capacity} tamu</strong> maks.</span></li>
              <li><BedDouble size={16} /><span><strong>{room.bed}</strong> tempat tidur</span></li>
            </ul>

            {room.description && <p className={s.desc}>{room.description}</p>}

            {room.facilities?.length > 0 && (
              <div className={s.block}>
                <h2 className={s.h3}>Fasilitas <em>kamar</em></h2>
                <ul className={s.facilities}>
                  {room.facilities.map((f) => (
                    <li key={f.id}>
                      <span className={s.fIcon}><FacilityIcon name={f.icon} /></span>
                      {f.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </section>

      {/* ---------- Kanan: kartu pemesanan ---------- */}
      <aside className={s.side}>
        {!user?.profile_complete ? (
          <CompleteProfile />
        ) : (
          <form className={s.card} onSubmit={submit} noValidate>
            <div className={s.cardHead}>
              <h2 className={s.h2}>Pesan <em>menginap</em></h2>
              {room && (
                <span className={`${s.avail} ${full ? s.full : s.ok}`} aria-live="polite">
                  <i />{full ? 'Penuh' : `Sisa ${room.units_left} unit`}
                </span>
              )}
            </div>

            <DateRangePicker checkIn={checkIn} checkOut={checkOut} minDate={today} onChange={setDates} />

            <Field label="Jumlah tamu">
              <div className={s.stepper}>
                <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} aria-label="Kurangi tamu" disabled={guests <= 1}><Minus size={16} /></button>
                <span>{guests} tamu</span>
                <button type="button" onClick={() => setGuests((g) => Math.min(room?.capacity ?? 20, g + 1))} aria-label="Tambah tamu" disabled={room && guests >= room.capacity}><Plus size={16} /></button>
              </div>
            </Field>

            <Textarea label="Catatan (opsional)" placeholder="Jam kedatangan, permintaan khusus, dsb." value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} rows={3} />

            <div className={s.guest}>
              <span>Pemesan</span>
              <strong>{user.name}</strong>
              <small>{user.email} · +{user.phone}</small>
            </div>

            {tooMany && <Alert tone="warn">Kapasitas kamar ini maksimal {room.capacity} tamu.</Alert>}

            {error && (
              <Alert tone="error">
                {error.message}
                {error.code === 'sold_out' && ' Pilih tanggal lain atau tipe kamar lain.'}
              </Alert>
            )}

            <dl className={s.rows}>
              <div><dt>{formatRupiah(room?.price)} × {nights} malam</dt><dd>{formatRupiah(total)}</dd></div>
              <div className={s.total}><dt>Total</dt><dd>{formatRupiah(total)}</dd></div>
            </dl>

            <Button type="submit" block loading={busy} disabled={!room || full || tooMany || nights < 1}>
              {busy ? 'Membuka pembayaran…' : full ? 'Kamar penuh' : `Bayar sekarang`}
            </Button>

            <p className={s.hold}><Clock size={15} /> Setelah memesan, kamar ditahan <strong>{holdMinutes} menit</strong> untuk pembayaran.</p>
            <p className={s.secure}><ShieldCheck size={15} /> Pembayaran diproses aman oleh Midtrans. Kami tidak menyimpan data kartu Anda.</p>
          </form>
        )}
      </aside>
    </div>
  )
}
