import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24, fontFamily: "'Inter Tight', system-ui, sans-serif" }}>
      <div>
        <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic', fontSize: 'clamp(72px, 14vw, 140px)', lineHeight: 1, margin: 0 }}>404</p>
        <p style={{ margin: '12px 0 24px', color: '#6b6b6b' }}>Halaman yang Anda cari tidak ditemukan.</p>
        <Link to="/" style={{ padding: '12px 24px', borderRadius: 999, background: '#141414', color: '#fff', fontWeight: 500, textDecoration: 'none' }}>
          Kembali ke beranda
        </Link>
      </div>
    </main>
  )
}
