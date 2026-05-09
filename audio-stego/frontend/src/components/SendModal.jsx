import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, FileAudio, Mail, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

export default function SendModal({ file, fileId, onClose }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSend = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }
    setLoading(true)
    try {
      await api.post(`/api/files/${fileId}/send`, { recipient_email: email })
      setSent(true)
      toast.success(`File sent to ${email}!`)
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to send file'
      toast.error(detail)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative glass-card border border-white/15 p-8 w-full max-w-md"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {!sent ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 to-purple-600/20 flex items-center justify-center border border-cyan-400/30">
                  <Send className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Send via Email</h2>
                  <p className="text-slate-500 text-sm">Deliver the encoded audio securely</p>
                </div>
              </div>

              {/* File preview */}
              {file && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 mb-5">
                  <FileAudio className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span className="text-sm text-slate-300 truncate">{typeof file === 'string' ? file : file.name}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-1.5 text-cyan-400" />
                    Recipient Email
                  </label>
                  <input
                    id="recipient-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="recipient@example.com"
                    className="input-field"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                  <button
                    onClick={handleSend}
                    disabled={loading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Send File</>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <motion.div
              className="text-center py-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div
                className="w-16 h-16 mx-auto rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                <CheckCircle className="w-8 h-8 text-green-400" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Sent Successfully!</h3>
              <p className="text-slate-400 text-sm mb-6">
                The encoded audio has been delivered to<br />
                <span className="text-cyan-400 font-medium">{email}</span>
              </p>
              <button onClick={onClose} className="btn-primary px-8">Done</button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
