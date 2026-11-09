import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { formatRupiah } from '../../lib/format'
import { api } from '../api/client'
import { useMyBooking } from '../api/hooks'
import { usePayment } from '../hooks/usePayment'
import { fmtClock, fmtDate, useCountdown } from '../lib/booking'
import StatusPill from '../components/StatusPill'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import s from './BookingDetailPage.module.css'

const PAY_METHOD = { bank_transfer: 'Transfer bank (VA)', echannel: 'Mandiri Bill', gopay: 'GoPay', qris: 'QRIS', credit_card: 'Kartu kredit/debit', shopeepay: 'ShopeePay', cstore: 'Gerai retail' }

export default function BookingDetailPage() {
  const { code } = useParams()
  const qc = useQueryClient()
  const { data: b, isLoading, isError, error, dataUpdatedAt, refetch } = useMyBooking(code)
  const { busy, run } = usePayment()
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [msg, setMsg] = useState(null)

  const left = useCountdown(b?.seconds_left ?? null, dataUpdatedAt)

  // Waktu habis di layar → ambil status terbaru dari server (kamar dilepas otomatis).
  useEffect(() => {
    if (left === 0 && b?.status === 'pending') refetch()
  }, [left, b?.status, refetch])

  const pay = async () => {
    setMsg(null)
    try {
      await run(async () => {
        const res = await api(`/customer/bookings/${code}/pay`, { method: 'POST' })
        return { code, payment: res.payment }
      })
    } catch (err) {
      setMsg({ tone: 'error', text: err.message })
      refetch()
    }
  }

  const cancel = async () => {
    setCancelling(true)
    setMsg(null)
    try {
      await api(`/customer/bookings/${code}/cancel`, { method: 'POST' })
      qc.invalidateQueries({ queryKey: ['my-bookings'] })
      qc.invalidateQueries({ queryKey: ['public-rooms'] })
      setConfirmCancel(false)
      await refetch()
    } catch (err) {
      setMsg({ tone: 'error', text: err.message })
    } finally {
      setCancelling(false)
    }
  }

  if (isLoading) return <div className={s.skel} aria-busy="true"><i /><i /><i /></div>

  if (isError) {
    return (
      <div className={s.box}>
        <h1 className={s.title}>Booking <em>tidak ditemukan</em></h1>
        <p className={s.muted}>{error.status === 404 ? 'Kode booking tidak ada di akun Anda.' : error.message}</p>
        <Link to="/akun/booking"><Button variant="outline">Kembali ke daftar</Button></Link>
      </div>
    )
  }

  const pending = b.status === 'pending'
  const urgent = left != null && left < 300

  return (
    <div className={s.page}>
      <Link to="/akun/booking" className={s.back}><ArrowLeft size={16} /> Semua booking</Link>

      <div className={s.head}>
        <div>
          <p className={s.code}>{b.code}</p>
          <h1 className={s.title}>{b.room?.name}</h1>
        </div>
        <StatusPill status={b.status} />
      </div>

      {b.status === 'confirmed' && (
        <Alert tone="success"><strong>Pembayaran diterima.</strong> Pesanan Anda dikonfirmasi. Sampai jumpa di {b.room?.name}!</Alert>
      )}

      {pending && (
        <div className={`${s.timer} ${urgent ? s.urgent : ''}`} role="timer" aria-live="off">
          <Clock size={22} />
          <div>
            <p>Selesaikan pembayaran dalam</p>
            <strong>{left != null ? fmtClock(left) : '--:--'}</strong>
          </div>
          <small>Setelah waktu habis, kamar dilepas otomatis.</small>
        </div>
      )}

      {b.status === 'cancelled' && (
        <Alert tone="error">
          <strong>Booking dibatalkan.</strong> {b.cancel_reason ?? ''}
          {b.cancel_reason === 'Waktu pembayaran habis' && ' Silakan buat pesanan baru bila kamar masih tersedia.'}
        </Alert>
      )}

      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}

      <div className={s.grid}>
        <div className={s.card}>
          <img src={b.room?.image_url} alt={b.room?.name} />
          <dl className={s.rows}>
            <div><dt>Check-in</dt><dd>{fmtDate(b.check_in)}</dd></div>
            <div><dt>Check-out</dt><dd>{fmtDate(b.check_out)}</dd></div>
            <div><dt>Durasi</dt><dd>{b.nights} malam</dd></div>
            <div><dt>Tamu</dt><dd>{b.guests} orang</dd></div>
            {b.notes && <div><dt>Catatan</dt><dd>{b.notes}</dd></div>}
          </dl>
        </div>

        <div className={s.card}>
          <h2 className={s.h2}>Pembayaran</h2>
          <dl className={s.rows}>
            <div><dt>Total</dt><dd className={s.total}>{formatRupiah(b.total_price)}</dd></div>
            <div><dt>Status</dt><dd>{b.payment?.status === 'paid' ? <span className={s.ok}><CheckCircle2 size={15} /> Lunas</span> : pending ? 'Belum dibayar' : b.status === 'cancelled' ? <span className={s.no}><XCircle size={15} /> Tidak dibayar</span> : '—'}</dd></div>
            {b.payment?.payment_type && <div><dt>Metode</dt><dd>{PAY_METHOD[b.payment.payment_type] ?? b.payment.payment_type}</dd></div>}
          </dl>

          {b.can_pay && (
            <div className={s.actions}>
              <Button block loading={busy} onClick={pay}>{busy ? 'Membuka pembayaran…' : 'Bayar sekarang'}</Button>

              {confirmCancel ? (
                <div className={s.confirm}>
                  <p>Batalkan pesanan ini? Kamar akan dilepas.</p>
                  <div>
                    <Button variant="danger" size="sm" loading={cancelling} onClick={cancel}>Ya, batalkan</Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmCancel(false)} disabled={cancelling}>Tidak</Button>
                  </div>
                </div>
              ) : (
                <Button variant="ghost" block disabled={busy} onClick={() => setConfirmCancel(true)}>Batalkan pesanan</Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
