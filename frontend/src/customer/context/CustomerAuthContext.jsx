import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, onUnauthorized, tokenStore } from '../api/client'
import { googleIdToken } from '../../lib/firebase'
import { queryClient } from '../../lib/queryClient'

const Ctx = createContext(null)

export function CustomerAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // 'loading' selama token tersimpan sedang diverifikasi
  const [status, setStatus] = useState(tokenStore.get() ? 'loading' : 'guest')

  useEffect(() => {
    if (!tokenStore.get()) return
    let alive = true
    api('/customer/me')
      .then((r) => alive && (setUser(r.user), setStatus('authed')))
      .catch((err) => {
        if (!alive) return
        if (err.status === 401 || err.status === 403) tokenStore.clear()
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
      }),
    [],
  )

  const accept = useCallback((res) => {
    tokenStore.set(res.token)
    setUser(res.user)
    setStatus('authed')
    return res.user
  }, [])

  const login = useCallback((email, password) => api('/customer/login', { method: 'POST', body: { email, password } }).then(accept), [accept])

  const register = useCallback((body) => api('/customer/register', { method: 'POST', body }).then(accept), [accept])

  /** Mengembalikan null bila pengguna menutup popup Google. */
  const loginWithGoogle = useCallback(async () => {
    const idToken = await googleIdToken()
    if (!idToken) return null
    return accept(await api('/customer/google', { method: 'POST', body: { id_token: idToken } }))
  }, [accept])

  const updateProfile = useCallback(async (body) => {
    const res = await api('/customer/me', { method: 'PUT', body })
    setUser(res.user)
    return res.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await api('/customer/logout', { method: 'POST' })
    } catch {
      /* token tetap dibuang di sisi klien */
    }
    tokenStore.clear()
    setUser(null)
    setStatus('guest')
    queryClient.removeQueries({ queryKey: ['my-bookings'] })
    queryClient.removeQueries({ queryKey: ['my-booking'] })
  }, [])

  const value = useMemo(
    () => ({ user, status, login, register, loginWithGoogle, updateProfile, logout }),
    [user, status, login, register, loginWithGoogle, updateProfile, logout],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useCustomerAuth = () => useContext(Ctx)
