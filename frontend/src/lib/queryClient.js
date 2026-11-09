import { QueryClient } from '@tanstack/react-query'

// Satu cache untuk seluruh aplikasi (landing, akun pelanggan, admin) sehingga data tidak diambil dua kali.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // dianggap segar 30 dtk → pindah halaman terasa instan
      gcTime: 10 * 60_000,
      retry: (count, err) => ![401, 403, 404, 422].includes(err?.status) && count < 1,
      refetchOnWindowFocus: false,
    },
  },
})
