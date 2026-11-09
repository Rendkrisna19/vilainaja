import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { CustomerAuthProvider } from './customer/context/CustomerAuthContext'

// Setiap area dipecah per-route: pengunjung website tidak mengunduh kode admin, dan sebaliknya.
const LandingPage = lazy(() => import('./landing/LandingPage'))

const LoginPage = lazy(() => import('./customer/pages/LoginPage'))
const RegisterPage = lazy(() => import('./customer/pages/RegisterPage'))
const CustomerLayout = lazy(() => import('./customer/layouts/CustomerLayout'))
const RequireCustomer = lazy(() => import('./customer/components/RequireCustomer'))
const CheckoutPage = lazy(() => import('./customer/pages/CheckoutPage'))
const MyBookingsPage = lazy(() => import('./customer/pages/MyBookingsPage'))
const BookingDetailPage = lazy(() => import('./customer/pages/BookingDetailPage'))

const AdminRoot = lazy(() => import('./admin/AdminRoot'))
const RequireAuth = lazy(() => import('./admin/components/layout/RequireAuth'))
const AdminLayout = lazy(() => import('./admin/layouts/AdminLayout'))
const AdminLogin = lazy(() => import('./admin/pages/Login/LoginPage'))
const DashboardPage = lazy(() => import('./admin/pages/Dashboard/DashboardPage'))
const BookingsPage = lazy(() => import('./admin/pages/Bookings/BookingsPage'))
const RoomsPage = lazy(() => import('./admin/pages/Rooms/RoomsPage'))
const LeadsPage = lazy(() => import('./admin/pages/Leads/LeadsPage'))
const SettingsPage = lazy(() => import('./admin/pages/Settings/SettingsPage'))
const NotFound = lazy(() => import('./NotFound'))

const guard = (el) => <RequireCustomer>{el}</RequireCustomer>

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomerAuthProvider>
        <BrowserRouter>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<LandingPage />} />

              {/* Pelanggan */}
              <Route path="/masuk" element={<LoginPage />} />
              <Route path="/daftar" element={<RegisterPage />} />
              <Route element={<CustomerLayout />}>
                <Route path="/booking/:slug" element={guard(<CheckoutPage />)} />
                <Route path="/akun/booking" element={guard(<MyBookingsPage />)} />
                <Route path="/akun/booking/:code" element={guard(<BookingDetailPage />)} />
              </Route>

              {/* Admin */}
              <Route path="/admin" element={<AdminRoot />}>
                <Route path="login" element={<AdminLogin />} />
                <Route
                  element={
                    <RequireAuth>
                      <AdminLayout />
                    </RequireAuth>
                  }
                >
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="bookings" element={<BookingsPage />} />
                  <Route path="rooms" element={<RoomsPage />} />
                  <Route path="leads" element={<LeadsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </CustomerAuthProvider>
    </QueryClientProvider>
  )
}
