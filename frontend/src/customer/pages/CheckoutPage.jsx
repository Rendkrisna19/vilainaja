import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { BedDouble, Clock, Phone, ShieldCheck, Users, Ruler, User } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { formatRupiah } from '../../lib/format'
import { api } from '../api/client'
import { usePublicRooms } from '../api/hooks'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { usePayment } from '../hooks/usePayment'
import { addDays, fmtDate, isoDate, newKey, nightsBetween } from '../lib/booking'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import { Field, Input, Textarea } from '../components/ui/Field'
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
      <Button type="submit" loading={saving}>Simpan &amp; lanjut</Button>
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
  const [checkIn, setCheckIn] = useState(() => (sp.get('check_in') >= today ? sp.get('check_in') : today))
  const [checkOut, setCheckOut] = useState(() => {
    const out = sp.get('check_out')
    return out && out > (sp.get('check_in') || today) ? out : addDays(sp.get('check_in') >= today ? sp.get('check_in') : today, 1)
  })
  const [guests, setGuests] = useState(() => Number(sp.get('guests')) || 2)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState(null)

  const { data, isLoading, isError } = usePublicRooms({ check_in: checkIn, check_out: checkOut, guests }, { refetchInterval: 8_000 })
  const room = data?.data.find((r) => r.slug === slug)
  const nights = nightsBetween(checkIn, checkOut)
  const holdMinutes = data?.meta.hold_minutes ?? 30

  // Satu kunci per "percobaan"; berganti saat pilihan berubah. Klik ulang memakai kunci yang sama → tidak ada booking ganda.
  const key = useRef(newKey())
  useEffect(() => {
    key.current = newKey()
  }, [room?.id, checkIn, checkOut, guests])

  const changeCheckIn = (v) => {
    setCheckIn(v)
    if (checkOut <= v) setCheckOut(addDays(v, 1))
  }

  const full = room && room.units_left < 1
  const tooMany = room && guests > room.capacity

  const submit = async (e) => {
    e.preventDefault()
    if (!room || full || tooMany || busy) return
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
      setError(err.errors ? { message: Object.values(err.errors)[0]?.[0] ?? err.message } : { message: err.message, code: err.code })
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

  return (
    <div className={s.layout}>
      <section className={s.main}>
        <h1 className={s.title}>Pesan <em>{room?.name ?? '…'}</em></h1>

        {!user?.profile_complete ? (
          <CompleteProfile />
        ) : (
          <form className={s.card} onSubmit={submit} noValidate>
            <h2 className={s.h2}>Detail <em>menginap</em></h2>

            <div className={s.grid2}>
              <Input label="Check-in" type="date" min={today} value={checkIn} onChange={(e) => changeCheckIn(e.target.value)} required />
              <Input label="Check-out" type="date" min={addDays(checkIn, 1)} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required />
            </div>

            <Field label="Jumlah tamu">
              <div className={s.stepper}>
                <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} aria-label="Kurangi">−</button>
                <span>{guests} tamu</span>
                <button type="button" onClick={() => setGuests((g) => Math.min(room?.capacity ?? 20, g + 1))} aria-label="Tambah">+</button>
              </div>
            </Field>

            <Textarea label="Catatan (opsional)" placeholder="Jam kedatangan, permintaan khusus, dsb." value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} />

            <div className={s.guest}>
              <p className={s.muted}>Pemesan</p>
              <p><strong>{user.name}</strong> · {user.email} · +{user.phone}</p>
            </div>

            {error && (
              <Alert tone="error">
                {error.message}
                {error.code === 'sold_out' && ' Pilih tanggal lain atau tipe kamar lain.'}
              </Alert>
            )}

            <Button type="submit" block loading={busy} disabled={!room || full || tooMany || nights < 1}>
              {busy ? 'Membuka pembayaran…' : full ? 'Kamar penuh' : `Bayar sekarang · ${formatRupiah((room?.price ?? 0) * nights)}`}
            </Button>

            <p className={s.secure}><ShieldCheck size={16} /> Pembayaran diproses aman oleh Midtrans. Kami tidak menyimpan data kartu Anda.</p>
          </form>
        )}
      </section>

      <aside className={s.side}>
        <div className={s.summary}>
          {room ? <img src={room.image_url} alt={room.name} /> : <div className={s.imgSkel} />}
          <div className={s.sumBody}>
            <h2 className={s.roomName}>{room?.name ?? ' '}</h2>
            {room && (
              <ul className={s.specs}>
                <li><Ruler size={15} /> {room.size} m²</li>
                <li><Users size={15} /> maks. {room.capacity} tamu</li>
                <li><BedDouble size={15} /> {room.bed}</li>
              </ul>
            )}

            {room && (
              <div className={`${s.avail} ${full ? s.full : s.ok}`} aria-live="polite">
                <span className={s.dot} />
                {full ? 'Penuh pada tanggal ini' : `Tersedia · sisa ${room.units_left} unit`}
                <small>diperbarui otomatis</small>
              </div>
            )}
            {tooMany && <Alert tone="warn">Kapasitas kamar ini maksimal {room.capacity} tamu.</Alert>}

            <dl className={s.rows}>
              <div><dt>Check-in</dt><dd>{fmtDate(checkIn)}</dd></div>
              <div><dt>Check-out</dt><dd>{fmtDate(checkOut)}</dd></div>
              <div><dt>{formatRupiah(room?.price)} × {nights} malam</dt><dd>{formatRupiah((room?.price ?? 0) * nights)}</dd></div>
              <div className={s.total}><dt>Total</dt><dd>{formatRupiah((room?.price ?? 0) * nights)}</dd></div>
            </dl>

            <p className={s.hold}><Clock size={16} /> Setelah memesan, kamar ditahan <strong>{holdMinutes} menit</strong> untuk Anda menyelesaikan pembayaran.</p>
          </div>
        </div>
      </aside>
    </div>
  )
}
