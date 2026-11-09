import { Navigate, useLocation } from 'react-router-dom'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { Loader2 } from 'lucide-react'

/** Halaman yang wajib login. Pengunjung diarahkan ke /masuk lalu dikembalikan ke halaman semula. */
export default function RequireCustomer({ children }) {
  const { status } = useCustomerAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', color: '#6b6b6b' }}>
        <Loader2 className="spin" size={26} style={{ animation: 'vspin .8s linear infinite' }} />
        <style>{'@keyframes vspin{to{transform:rotate(360deg)}}'}</style>
      </div>
    )
  }

  if (status === 'guest') {
    return <Navigate to={`/masuk?next=${encodeURIComponent(location.pathname + location.search)}`} replace />
  }

  return children
}
