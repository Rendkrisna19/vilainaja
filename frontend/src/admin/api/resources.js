import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import { createResource } from './createResource'
import { useToast } from '../components/ui/Toast'

export const rooms = createResource('rooms', { label: 'Kamar' })
export const bookings = createResource('bookings', { label: 'Booking' })
export const leads = createResource('leads', { label: 'Lead' })

export const useDashboard = () =>
  useQuery({ queryKey: ['dashboard'], queryFn: ({ signal }) => api('/dashboard', { signal }) })

export const useSettings = () =>
  useQuery({ queryKey: ['settings'], queryFn: ({ signal }) => api('/settings', { signal }), select: (r) => r.data })

export function useSaveSettings() {
  const qc = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (body) => api('/settings', { method: 'PUT', body }),
    onSuccess: (res) => {
      qc.setQueryData(['settings'], res)
      toast.success('Pengaturan berhasil disimpan.')
    },
    onError: (err) => toast.error(err.status === 422 ? 'Periksa kembali data yang diisi.' : err.message),
  })
}
