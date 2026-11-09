import { API_URL } from './env'

export class ApiError extends Error {
  constructor(message, status, errors, code) {
    super(message)
    this.status = status
    this.errors = errors || {}
    this.code = code
  }
}

const toQuery = (params) => {
  if (!params) return ''
  const s = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') s.set(k, v)
  })
  const str = s.toString()
  return str ? `?${str}` : ''
}

/**
 * Membuat klien API dengan penyimpanan token sendiri.
 * Admin dan pelanggan memakai kunci token berbeda sehingga sesi keduanya tidak saling mengganggu.
 */
export function createClient({ tokenKey }) {
  const tokenStore = {
    get: () => localStorage.getItem(tokenKey),
    set: (t) => localStorage.setItem(tokenKey, t),
    clear: () => localStorage.removeItem(tokenKey),
  }

  // Dipanggil bila server menjawab 401 saat token masih tersimpan (sesi habis).
  const listeners = new Set()
  const onUnauthorized = (fn) => {
    listeners.add(fn)
    return () => listeners.delete(fn)
  }

  async function api(path, { method = 'GET', body, params, signal } = {}) {
    const headers = { Accept: 'application/json' }
    const token = tokenStore.get()
    if (token) headers.Authorization = `Bearer ${token}`
    if (body !== undefined) headers['Content-Type'] = 'application/json'

    let res
    try {
      res = await fetch(`${API_URL}${path}${toQuery(params)}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal,
      })
    } catch (e) {
      if (e.name === 'AbortError') throw e
      throw new ApiError('Tidak dapat terhubung ke server. Periksa koneksi Anda.', 0)
    }

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      if (res.status === 401 && token) {
        tokenStore.clear()
        listeners.forEach((fn) => fn())
      }
      throw new ApiError(data?.message || 'Terjadi kesalahan pada server.', res.status, data?.errors, data?.code)
    }

    return data
  }

  return { api, tokenStore, onUnauthorized }
}
