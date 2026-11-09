import { Link } from 'react-router-dom'
import { BedDouble, CalendarCheck, CalendarClock, MessageSquare, UserPlus, Wallet } from 'lucide-react'
import { useDashboard } from '../../api/resources'
import { formatDate, formatRupiah, initials } from '../../../lib/format'
import { BOOKING_STATUS, LEAD_SOURCE, LEAD_STATUS } from '../../lib/constants'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/Badge'
import StatCard from './components/StatCard'
import MonthlyChart from './components/MonthlyChart'
import StatusBreakdown from './components/StatusBreakdown'
import RowList from './components/RowList'
import s from './components/Dashboard.module.css'

const monthShort = (iso) => new Date(iso + 'T00:00').toLocaleDateString('id-ID', { month: 'short' })
const dayNum = (iso) => iso.slice(8, 10)

export default function DashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard()
  const stats = data?.stats

  const recentBookings = (data?.recent_bookings ?? []).map((b) => ({
    key: b.id,
    lead: <span className={s.avatar}>{initials(b.guest_name)}</span>,
    title: b.guest_name,
    sub: `${b.room?.name} · ${formatDate(b.check_in)}`,
    end: (
      <>
        <StatusBadge map={BOOKING_STATUS} status={b.status} />
        <span>{formatRupiah(b.total_price)}</span>
      </>
    ),
  }))

  const upcoming = (data?.upcoming_checkins ?? []).map((b) => ({
    key: b.id,
    lead: (
      <span className={s.dateBox}>
        <strong>{dayNum(b.check_in)}</strong>
        <span>{monthShort(b.check_in)}</span>
      </span>
    ),
    title: b.guest_name,
    sub: `${b.room?.name} · ${b.nights} malam · ${b.guests} tamu`,
    end: <StatusBadge map={BOOKING_STATUS} status={b.status} />,
  }))

  const leads = (data?.recent_leads ?? []).map((l) => ({
    key: l.id,
    lead: <span className={s.avatar}>{initials(l.name)}</span>,
    title: l.name,
    sub: l.message || LEAD_SOURCE[l.source],
    end: <StatusBadge map={LEAD_STATUS} status={l.status} />,
  }))

  return (
    <>
      <PageHeader
        title="Ringkasan"
        accent="hari ini"
        description="Pantau booking, okupansi kamar, dan prospek tamu secara langsung."
        actions={<Button variant="outline" onClick={() => refetch()} loading={isFetching && !isLoading}>Segarkan</Button>}
      />

      {isError && (
        <Card>
          <p style={{ color: 'var(--a-red-fg)' }}>Gagal memuat dashboard: {error.message}</p>
        </Card>
      )}

      <div className={s.stats}>
        <StatCard
          loading={isLoading}
          icon={CalendarCheck}
          label="Total booking"
          value={stats?.total_bookings}
          hint={`${stats?.pending_bookings} menunggu konfirmasi`}
        />
        <StatCard
          loading={isLoading}
          icon={Wallet}
          label="Pendapatan bulan ini"
          value={formatRupiah(stats?.revenue_month)}
          hint="Booking aktif dengan check-in bulan ini"
        />
        <StatCard
          loading={isLoading}
          icon={BedDouble}
          label="Okupansi hari ini"
          value={`${stats?.occupancy}%`}
          hint={`${stats?.occupied_units} dari ${stats?.total_units} unit terisi`}
        />
        <StatCard
          loading={isLoading}
          icon={UserPlus}
          label="Lead baru"
          value={stats?.new_leads}
          hint="Belum dihubungi"
        />
      </div>

      <div className={s.grid2}>
        <Card title="Booking 6 bulan terakhir">
          <MonthlyChart data={data?.monthly} loading={isLoading} />
        </Card>
        <Card title="Status booking">
          <StatusBreakdown counts={data?.status_counts} loading={isLoading} />
        </Card>
      </div>

      <div className={s.grid3}>
        <Card title="Booking terbaru" action={<Link to="/admin/bookings" className={s.link}>Lihat semua</Link>}>
          <RowList
            items={recentBookings}
            loading={isLoading}
            rows={6}
            empty={{ icon: CalendarCheck, title: 'Belum ada booking' }}
          />
        </Card>
        <Card title="Check-in mendatang" action={<Link to="/admin/bookings" className={s.link}>Kelola</Link>}>
          <RowList
            items={upcoming}
            loading={isLoading}
            empty={{ icon: CalendarClock, title: 'Tidak ada check-in mendatang' }}
          />
        </Card>
        <Card title="Lead terbaru" action={<Link to="/admin/leads" className={s.link}>Lihat semua</Link>}>
          <RowList
            items={leads}
            loading={isLoading}
            empty={{ icon: MessageSquare, title: 'Belum ada lead' }}
          />
        </Card>
      </div>
    </>
  )
}
