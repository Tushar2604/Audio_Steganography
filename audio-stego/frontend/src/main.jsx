import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import App from './App.jsx'
import './index.css'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {publishableKey ? (
      <ClerkProvider publishableKey={publishableKey}>
        <App />
      </ClerkProvider>
    ) : (
      <div style={{ padding: 24, color: '#e2e8f0', background: '#0a0a0f', minHeight: '100vh' }}>
        Missing `VITE_CLERK_PUBLISHABLE_KEY` in frontend environment.
      </div>
    )}
  </React.StrictMode>,
)
