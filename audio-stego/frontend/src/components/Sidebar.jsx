import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { UserButton, useUser } from '@clerk/react'
import {
  LayoutDashboard, Radio, Search, Clock, Shield, Menu, X,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/encode',    icon: Radio,          label: 'Encode' },
  { to: '/decode',    icon: Search,         label: 'Decode' },
  { to: '/history',   icon: Clock,          label: 'History' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [mobileOpen, setMobileOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center neon-glow">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">AudioStego</span>
        </div>
        <div className="mt-5 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
          <UserButton
            afterSignOutUrl="/"
            appearance={{ elements: { userButtonAvatarBox: 'w-9 h-9' } }}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.fullName || user?.firstName || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.primaryEmailAddress?.emailAddress || ''}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `sidebar-link flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
              ${isActive
                ? 'active text-cyan-400 bg-gradient-to-r from-cyan-400/10 to-purple-600/10 border-l-2 border-cyan-400'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => navigate('/')}
          className="w-full btn-secondary text-sm py-2.5"
        >
          Back to Home
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-surface border-r border-white/10 h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl glass-card border border-white/20 text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="lg:hidden fixed left-0 top-0 h-full w-72 bg-surface border-r border-white/10 z-50 flex flex-col"
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
