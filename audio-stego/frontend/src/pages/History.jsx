import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, FileAudio, Download, Send, Trash2,
  Loader2, Search, Filter, AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'
import Sidebar from '../components/Sidebar'
import SendModal from '../components/SendModal'
import api from '../api/axios'

const tabs = ['Encoded Files', 'Sent Files']

function ConfirmDialog({ filename, onConfirm, onCancel }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        className="relative glass-card border border-red-500/20 p-7 w-full max-w-sm text-center"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
      >
        <div className="w-14 h-14 mx-auto rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Delete File?</h3>
        <p className="text-slate-400 text-sm mb-6">
          <span className="text-white font-medium">{filename}</span> will be permanently deleted and cannot be recovered.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 text-sm"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function History() {
  const [activeTab, setActiveTab] = useState(0)
  const [files, setFiles] = useState([])
  const [sentFiles, setSentFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sendTarget, setSendTarget] = useState(null) // { fileId, filename }
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [filesRes, sentRes] = await Promise.all([
        api.get('/api/files/history'),
        api.get('/api/files/sent'),
      ])
      setFiles(filesRes.data)
      setSentFiles(sentRes.data)
    } catch {
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleDownload = async (fileId, filename) => {
    try {
      const res = await api.get(`/api/files/${fileId}/download`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `encoded_${filename}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Download started!')
    } catch {
      toast.error('Download failed')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/api/files/${deleteTarget.fileId}`)
      toast.success('File deleted')
      setFiles(prev => prev.filter(f => f.id !== deleteTarget.fileId))
      setDeleteTarget(null)
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const formatSize = (bytes) => {
    if (!bytes) return '—'
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const filteredFiles = files.filter(f =>
    f.original_filename.toLowerCase().includes(search.toLowerCase())
  )
  const filteredSent = sentFiles.filter(s =>
    s.filename?.toLowerCase().includes(search.toLowerCase()) ||
    s.recipient_email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2">
              <span className="gradient-text">History</span>
            </h1>
            <p className="text-slate-500">Manage your encoded and sent audio files.</p>
          </div>

          {/* Tabs + Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex rounded-xl border border-white/10 overflow-hidden">
              {tabs.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    activeTab === i
                      ? 'bg-gradient-to-r from-cyan-400/20 to-purple-600/20 text-white border-b-2 border-cyan-400'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === i ? 'bg-cyan-400/20 text-cyan-400' : 'bg-white/5 text-slate-500'}`}>
                    {i === 0 ? files.length : sentFiles.length}
                  </span>
                </button>
              ))}
            </div>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="history-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files..."
                className="input-field pl-9 py-2.5 text-sm"
              />
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="glass-card p-10 flex items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading...
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* Encoded Files Tab */}
              {activeTab === 0 && (
                <motion.div key="encoded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {filteredFiles.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                      <FileAudio className="w-14 h-14 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-400 font-medium">No encoded files found</p>
                      <p className="text-slate-600 text-sm mt-1">
                        {search ? 'Try a different search term.' : 'Encode your first audio file to see it here.'}
                      </p>
                    </div>
                  ) : (
                    <div className="glass-card overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">File</th>
                            <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Size</th>
                            <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                            <th className="px-5 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredFiles.map((f, i) => (
                            <motion.tr
                              key={f.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.04 }}
                              className="hover:bg-white/3 transition-colors group"
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center shrink-0">
                                    <FileAudio className="w-4 h-4 text-cyan-400" />
                                  </div>
                                  <span className="text-white text-sm font-medium truncate max-w-[180px]">{f.original_filename}</span>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-slate-400 text-sm hidden sm:table-cell">{formatSize(f.file_size)}</td>
                              <td className="px-5 py-4 text-slate-500 text-xs hidden lg:table-cell">{formatDate(f.created_at)}</td>
                              <td className="px-5 py-4">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleDownload(f.id, f.original_filename)}
                                    className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all"
                                    title="Download"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setSendTarget({ fileId: f.id, filename: f.original_filename })}
                                    className="p-2 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-400/10 transition-all"
                                    title="Send"
                                  >
                                    <Send className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteTarget({ fileId: f.id, filename: f.original_filename })}
                                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Sent Files Tab */}
              {activeTab === 1 && (
                <motion.div key="sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {filteredSent.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                      <Send className="w-14 h-14 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-400 font-medium">No sent files yet</p>
                      <p className="text-slate-600 text-sm mt-1">Files you send via email will appear here.</p>
                    </div>
                  ) : (
                    <div className="glass-card overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">File</th>
                            <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Recipient</th>
                            <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Sent</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredSent.map((s, i) => (
                            <motion.tr
                              key={s.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.04 }}
                              className="hover:bg-white/3 transition-colors"
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-lg bg-purple-600/10 border border-purple-600/20 flex items-center justify-center shrink-0">
                                    <Send className="w-4 h-4 text-purple-400" />
                                  </div>
                                  <span className="text-white text-sm font-medium truncate max-w-[160px]">{s.filename}</span>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-slate-400 text-sm hidden sm:table-cell">
                                <span className="bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 text-xs font-medium">
                                  {s.recipient_email}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-slate-500 text-xs hidden lg:table-cell">{formatDate(s.sent_at)}</td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      </main>

      {/* Send Modal */}
      {sendTarget && (
        <SendModal
          file={sendTarget.filename}
          fileId={sendTarget.fileId}
          onClose={() => setSendTarget(null)}
        />
      )}

      {/* Confirm Delete */}
      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDialog
            filename={deleteTarget.filename}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
