let loading = null

/** Memuat snap.js Midtrans sekali saja. `url` dan `clientKey` datang dari backend, bukan hardcode. */
export function loadSnap({ url, clientKey }) {
  if (window.snap) return Promise.resolve(window.snap)
  if (loading) return loading

  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.setAttribute('data-client-key', clientKey)
    script.onload = () => resolve(window.snap)
    script.onerror = () => {
      loading = null
      script.remove()
      reject(new Error('Gagal memuat halaman pembayaran. Periksa koneksi internet Anda.'))
    }
    document.head.appendChild(script)
  })

  return loading
}
