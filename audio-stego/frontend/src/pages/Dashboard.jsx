import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/react'
import { Radio, Search, Clock, Send, FileAudio, TrendingUp, Zap } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import api from '../api/axios'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    className="glass-card p-6 flex items-center gap-5"
    variants={pageVariants}
    initial="initial"
    animate="animate"
    transition={{ delay }}
  >
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center border border-white/10`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <div>
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="text-3xl font-black text-white">{value}</p>
    </div>
  </motion.div>
)

const QuickAction = ({ icon: Icon, title, desc, to, color }) => {
  const navigate = useNavigate()
  return (
    <motion.button
      onClick={() => navigate(to)}
      className={`glass-card p-6 text-left hover:scale-105 transition-all duration-300 border border-white/10 hover:border-white/20 w-full`}
      whileTap={{ scale: 0.98 }}
    >
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 border border-white/10`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-white font-semibold mb-1">{title}</h3>
      <p className="text-slate-500 text-sm">{desc}</p>
    </motion.button>
  )
}

export default function Dashboard() {
  const { user } = useUser()
  const [stats, setStats] = useState({ encoded: 0, sent: 0 })
  const [recentFiles, setRecentFiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, filesRes] = await Promise.all([
          api.get('/api/files/stats'),
          api.get('/api/files/history'),
        ])
        setStats(statsRes.data)
        setRecentFiles(filesRes.data.slice(0, 5))
      } catch {
        // fail silently
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const formatSize = (bytes) => {
    if (!bytes) return '—'
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        {/* Header */}
        <motion.div className="mb-10" variants={pageVariants} initial="initial" animate="animate">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">👋</span>
            <h1 className="text-3xl font-black text-white">
              Hello, <span className="gradient-text">{user?.firstName || 'there'}</span>
            </h1>
          </div>
          <p className="text-slate-500 ml-1">Your steganography workspace — all your secrets in one place.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <StatCard icon={FileAudio} label="Files Encoded" value={stats.encoded} color="bg-gradient-to-br from-cyan-400/30 to-cyan-400/5" delay={0.1} />
          <StatCard icon={Send} label="Files Sent" value={stats.sent} color="bg-gradient-to-br from-purple-600/30 to-purple-600/5" delay={0.2} />
          <StatCard icon={TrendingUp} label="Total Activity" value={stats.encoded + stats.sent} color="bg-gradient-to-br from-green-500/30 to-green-500/5" delay={0.3} />
        </div>

        {/* Quick Actions */}
        <motion.h2
          className="text-lg font-bold text-white mb-4 flex items-center gap-2"
          variants={pageVariants} initial="initial" animate="animate" transition={{ delay: 0.35 }}
        >
          <Zap className="w-5 h-5 text-cyan-400" /> Quick Actions
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <QuickAction icon={Radio} title="Encode Audio" desc="Hide a secret message inside a WAV file" to="/encode" color="bg-gradient-to-br from-cyan-400/20 to-purple-600/10" />
          <QuickAction icon={Search} title="Decode Audio" desc="Extract a hidden message from a WAV file" to="/decode" color="bg-gradient-to-br from-purple-600/20 to-purple-600/5" />
          <QuickAction icon={Clock} title="View History" desc="Manage all your encoded files" to="/history" color="bg-gradient-to-br from-green-500/20 to-green-500/5" />
        </div>

        {/* Recent Files */}
        <motion.div variants={pageVariants} initial="initial" animate="animate" transition={{ delay: 0.45 }}>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" /> Recent Files
          </h2>
          {loading ? (
            <div className="glass-card p-8 text-center text-slate-500">Loading...</div>
          ) : recentFiles.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <FileAudio className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500">No encoded files yet.</p>
              <p className="text-slate-600 text-sm mt-1">Encode your first audio file to get started!</p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">File</th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Size</th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentFiles.map((f) => (
                    <tr key={f.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <FileAudio className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span className="text-white text-sm font-medium truncate max-w-[200px]">{f.original_filename}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-sm hidden sm:table-cell">{formatSize(f.file_size)}</td>
                      <td className="px-5 py-4 text-slate-400 text-sm hidden md:table-cell">{formatDate(f.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
