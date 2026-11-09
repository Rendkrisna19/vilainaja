import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api } from './client'

/**
 * Daftar kamar + sisa unit untuk rentang tanggal. Diperbarui otomatis (polling) sehingga
 * kamar yang baru saja dipesan orang lain langsung berubah menjadi "Penuh".
 */
export function usePublicRooms({ check_in, check_out, guests } = {}, { refetchInterval = 10_000, enabled = true } = {}) {
  return useQuery({
    queryKey: ['public-rooms', check_in ?? null, check_out ?? null, guests ?? null],
    queryFn: ({ signal }) => api('/public/rooms', { params: { check_in, check_out, guests }, signal }),
    placeholderData: keepPreviousData,
    refetchInterval,
    staleTime: 5_000,
    enabled,
  })
}

export const useMyBookings = () =>
  useQuery({
    queryKey: ['my-bookings'],
    queryFn: ({ signal }) => api('/customer/bookings', { signal }),
    select: (r) => r.data,
    refetchInterval: 15_000,
  })

/** Detail booking; selama menunggu pembayaran dipoll tiap 4 dtk (server menyelaraskan status dengan Midtrans). */
export const useMyBooking = (code) =>
  useQuery({
    queryKey: ['my-booking', code],
    queryFn: ({ signal }) => api(`/customer/bookings/${code}`, { signal }),
    select: (r) => r.data,
    refetchInterval: (q) => (q.state.data?.data?.status === 'pending' ? 4_000 : false),
    staleTime: 0,
  })
