import { Link } from 'react-router-dom'
import { CalendarX2, Clock } from 'lucide-react'
import { formatRupiah } from '../../lib/format'
import { useMyBookings } from '../api/hooks'
import { fmtDate } from '../lib/booking'
import StatusPill from '../components/StatusPill'
import Button from '../components/ui/Button'
import s from './MyBookingsPage.module.css'

function Skeleton() {
  return (
    <ul className={s.list} aria-busy="true">
      {[0, 1, 2].map((i) => (
        <li key={i} className={`${s.item} ${s.skel}`}><span className={s.thumb} /><div className={s.lines}><i /><i /><i /></div></li>
      ))}
    </ul>
  )
}

export default function MyBookingsPage() {
  const { data, isLoading, isError, error } = useMyBookings()

  return (
    <>
      <h1 className={s.title}>Booking <em>saya</em></h1>

      {isLoading ? (
        <Skeleton />
      ) : isError ? (
        <p className={s.error}>Gagal memuat booking: {error.message}</p>
      ) : data.length === 0 ? (
        <div className={s.empty}>
          <CalendarX2 size={30} />
          <h2>Belum ada booking</h2>
          <p>Pilih kamar favorit Anda dan pesan dalam beberapa menit.</p>
          <Link to="/#kamar"><Button>Lihat kamar</Button></Link>
        </div>
      ) : (
        <ul className={s.list}>
          {data.map((b) => (
            <li key={b.code}>
              <Link to={`/akun/booking/${b.code}`} className={s.item}>
                <img className={s.thumb} src={b.room?.image_url} alt="" loading="lazy" />
                <div className={s.body}>
                  <div className={s.top}>
                    <h2>{b.room?.name}</h2>
                    <StatusPill status={b.status} />
                  </div>
                  <p className={s.dates}>{fmtDate(b.check_in)} → {fmtDate(b.check_out)} · {b.nights} malam · {b.guests} tamu</p>
                  <div className={s.bottom}>
                    <span className={s.code}>{b.code}</span>
                    <strong>{formatRupiah(b.total_price)}</strong>
                  </div>
                  {b.can_pay && <p className={s.warn}><Clock size={15} /> Menunggu pembayaran — buka untuk melanjutkan</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
