import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from '@clerk/react'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Encode from './pages/Encode'
import Decode from './pages/Decode'
import History from './pages/History'
import { setTokenProvider } from './api/authTokenProvider'

function ClerkTokenBridge() {
  const { getToken } = useAuth()

  setTokenProvider(() => getToken())
  return null
}

function ProtectedRoute({ children }) {
  const { isSignedIn } = useAuth()
  return isSignedIn ? children : <Navigate to="/" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/encode" element={<ProtectedRoute><Encode /></ProtectedRoute>} />
      <Route path="/decode" element={<ProtectedRoute><Decode /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ClerkTokenBridge />
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
          },
          success: {
            iconTheme: { primary: '#00d4ff', secondary: '#0a0a0f' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#0a0a0f' },
          },
        }}
      />
    </BrowserRouter>
  )
}
