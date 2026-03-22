import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import EditorPage from './pages/EditorPage'

function PrivateRoute({ children }) {
  const token = useAuthStore(s => s.token)
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  const init = useAuthStore(s => s.init)
  const isLoading = useAuthStore(s => s.isLoading)

  useEffect(() => { init() }, [])

  if (isLoading) return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center">
      <div className="flex items-center gap-3 text-ink-400">
        <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading MS CV Pro…</span>
      </div>
    </div>
  )

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/editor/:cvId" element={<PrivateRoute><EditorPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
