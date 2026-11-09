import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import { createResource } from './createResource'
import { useToast } from '../components/ui/Toast'

export const rooms = createResource('rooms', { label: 'Kamar' })
export const bookings = createResource('bookings', { label: 'Booking' })
export const leads = createResource('leads', { label: 'Lead' })

export const useFacilities = () =>
  useQuery({ queryKey: ['facilities'], queryFn: ({ signal }) => api('/facilities', { signal }), select: (r) => r.data, staleTime: 5 * 60_000 })

/** Unggah foto kamar (sudah dikompres di browser). Mengembalikan kamar terbaru. */
export function useUploadRoomImages() {
  const qc = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ roomId, files }) => {
      const form = new FormData()
      files.forEach((f) => form.append('images[]', f, f.name))
      return api(`/rooms/${roomId}/images`, { method: 'POST', body: form })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rooms'] })
      toast.success('Foto kamar berhasil diunggah.')
    },
    onError: (err) => toast.error(err.message),
  })
}

export function useDeleteRoomImage() {
  const qc = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (imageId) => api(`/room-images/${imageId}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rooms'] })
      toast.success('Foto dihapus.')
    },
    onError: (err) => toast.error(err.message),
  })
}

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
