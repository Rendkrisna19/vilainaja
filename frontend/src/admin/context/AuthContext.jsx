import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api, onUnauthorized, tokenStore } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState(null)
  // 'loading' selama token tersimpan sedang diverifikasi ke server
  const [status, setStatus] = useState(tokenStore.get() ? 'loading' : 'guest')

  useEffect(() => {
    if (!tokenStore.get()) return
    let alive = true
    api('/auth/me')
      .then((res) => {
        if (!alive) return
        setUser(res.user)
        setStatus('authed')
      })
      .catch((err) => {
        if (!alive) return
        // Hanya buang token jika server menolaknya; gangguan jaringan tidak memutus sesi.
        if (err.status === 401) tokenStore.clear()
        setStatus('guest')
      })
    return () => {
      alive = false
    }
  }, [])

  useEffect(
    () =>
      onUnauthorized(() => {
        setUser(null)
        setStatus('guest')
        queryClient.clear()
      }),
    [queryClient],
  )

  const login = useCallback(async (email, password) => {
    const res = await api('/auth/login', { method: 'POST', body: { email, password } })
    tokenStore.set(res.token)
    setUser(res.user)
    setStatus('authed')
  }, [])

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' })
    } catch {
      /* token tetap dibuang di sisi klien */
    }
    tokenStore.clear()
    setUser(null)
    setStatus('guest')
    queryClient.clear()
  }, [queryClient])

  const value = useMemo(() => ({ user, status, login, logout }), [user, status, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
