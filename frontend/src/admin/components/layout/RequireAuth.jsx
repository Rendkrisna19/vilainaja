import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Skeleton from '../ui/Skeleton'

// Skeleton seluruh halaman saat token tersimpan sedang diverifikasi.
function ShellSkeleton() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }} aria-busy="true" aria-label="Memuat">
      <div className="shell-skel" style={{ width: 272, padding: 18, display: 'grid', gap: 10, alignContent: 'start', borderRight: '1px solid var(--a-border)', background: 'var(--a-surface)' }}>
        <Skeleton width={140} height={30} />
        <div style={{ height: 14 }} />
        {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} height={44} radius={12} />)}
      </div>
      <div style={{ flex: 1, padding: 32, display: 'grid', gap: 18, alignContent: 'start' }}>
        <Skeleton width={260} height={38} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} height={112} radius={20} />)}
        </div>
        <Skeleton height={300} radius={20} />
      </div>
    </div>
  )
}

export default function RequireAuth({ children }) {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <ShellSkeleton />
  if (status === 'guest') return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  return children
}
