import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import './styles/admin.css'

// Toast dan modal dirender di dalam elemen .admin supaya ikut token tema (terang/gelap).
function ThemedShell() {
  const { theme } = useTheme()

  // Hilangkan margin bawaan body dan samakan warna latar dengan tema (tanpa bingkai putih / kilatan saat overscroll).
  useEffect(() => {
    const { margin, backgroundColor } = document.body.style
    document.body.style.margin = '0'
    document.body.style.backgroundColor = theme === 'dark' ? '#0f0e0d' : '#f5f3ef'
    return () => {
      document.body.style.margin = margin
      document.body.style.backgroundColor = backgroundColor
    }
  }, [theme])

  return (
    <div className="admin" data-theme={theme}>
      <ToastProvider>
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      </ToastProvider>
    </div>
  )
}

/** Akar seluruh rute /admin: tema, toast, dan autentikasi admin. Query cache dipakai bersama dari App. */
export default function AdminRoot() {
  return (
    <ThemeProvider>
      <ThemedShell />
    </ThemeProvider>
  )
}
