import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { queryClient } from '../../lib/queryClient'
import { loadSnap } from '../../lib/snap'

/**
 * Membuka popup pembayaran Midtrans Snap.
 * `busy` mengunci tombol sejak klik pertama sampai popup ditutup, sehingga tidak bisa diklik dua kali.
 */
export function usePayment() {
  const navigate = useNavigate()
  const lock = useRef(false)
  const [busy, setBusy] = useState(false)

  const open = useCallback(
    async ({ code, payment }) => {
      const snap = await loadSnap({ url: payment.snap_url, clientKey: payment.client_key })
      const done = () => {
        queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
        queryClient.invalidateQueries({ queryKey: ['public-rooms'] })
        lock.current = false
        setBusy(false)
        navigate(`/akun/booking/${code}`)
      }
      snap.pay(payment.snap_token, { onSuccess: done, onPending: done, onError: done, onClose: done })
    },
    [navigate],
  )

  /** Jalankan `action` (mis. buat booking) sekali; ia harus mengembalikan { code, payment }. */
  const run = useCallback(
    async (action) => {
      if (lock.current) return
      lock.current = true
      setBusy(true)
      try {
        await open(await action())
      } catch (err) {
        lock.current = false
        setBusy(false)
        throw err
      }
    },
    [open],
  )

  return { busy, run }
}
