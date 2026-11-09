import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import { useToast } from '../components/ui/Toast'

/**
 * Membuat hook CRUD untuk satu resource REST.
 *  - useList: daftar berpaginasi, data halaman sebelumnya tetap tampil saat memuat halaman baru
 *  - useCreate/useUpdate/useDelete: otomatis menyegarkan data dan menampilkan toast
 */
export function createResource(name, { label }) {
  // Booking & kamar berubah dari sisi pelanggan (bayar, batal, kedaluwarsa), jadi daftar diperbarui berkala.
  const useList = (params = {}) =>
    useQuery({
      queryKey: [name, 'list', params],
      queryFn: ({ signal }) => api(`/${name}`, { params, signal }),
      placeholderData: keepPreviousData,
      refetchInterval: 10_000,
      refetchIntervalInBackground: false,
    })

  const useMutate = (mutationFn, successMessage) => {
    const qc = useQueryClient()
    const toast = useToast()

    return useMutation({
      mutationFn,
      onSuccess: () => {
        // Data saling berkaitan (kamar ↔ booking ↔ dashboard), jadi semuanya ditandai usang.
        qc.invalidateQueries()
        toast.success(successMessage)
      },
      onError: (err) => {
        toast.error(err.status === 422 ? 'Periksa kembali data yang diisi.' : err.message)
      },
    })
  }

  const useCreate = () =>
    useMutate((body) => api(`/${name}`, { method: 'POST', body }), `${label} berhasil ditambahkan.`)

  const useUpdate = () =>
    useMutate(({ id, ...body }) => api(`/${name}/${id}`, { method: 'PUT', body }), `${label} berhasil diperbarui.`)

  const useDelete = () =>
    useMutate((id) => api(`/${name}/${id}`, { method: 'DELETE' }), `${label} berhasil dihapus.`)

  return { useList, useCreate, useUpdate, useDelete }
}
