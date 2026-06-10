import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './providers/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { TitleDetailPage } from './pages/TitleDetailPage'
import { WatchlistPage } from './pages/WatchlistPage'

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <span className="text-sm text-neutral-400">Loading…</span>
    </div>
  )
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <Loading />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <Loading />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/title/:tmdbId" element={<ProtectedRoute><TitleDetailPage /></ProtectedRoute>} />
      <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
    </Routes>
  )
}
