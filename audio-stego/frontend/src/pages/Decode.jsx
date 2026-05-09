import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, UploadCloud, Key, Eye, EyeOff,
  Loader2, Copy, CheckCircle, MessageSquare
} from 'lucide-react'
import toast from 'react-hot-toast'
import Sidebar from '../components/Sidebar'
import DropZone from '../components/DropZone'
import Waveform from '../components/Waveform'
import api from '../api/axios'

const TECHNIQUES = [
  { id: 'lsb', label: 'Basic (LSB)', hint: 'Decode files encoded using LSB' },
  { id: 'phase', label: 'Advanced (Phase Encoding)', hint: 'Decode files encoded using phase encoding' },
]

function TypewriterText({ text }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    if (!text) return
    let i = 0
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, i + 1))
      i++
      if (i >= text.length) { clearInterval(timer); setDone(true) }
    }, 20)
    return () => clearInterval(timer)
  }, [text])

  return (
    <span className={`font-mono text-sm text-green-300 whitespace-pre-wrap break-words ${!done ? 'typewriter' : ''}`}>
      {displayed}
    </span>
  )
}

export default function Decode() {
  const [file, setFile] = useState(null)
  const [passkey, setPasskey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [decoding, setDecoding] = useState(false)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const [technique, setTechnique] = useState('lsb')

  const handleDecode = async () => {
    if (!file) { toast.error('Upload a WAV file first'); return }
    setDecoding(true)
    setResult(null)
    try {
      const form = new FormData()
      form.append('audio_file', file)
      form.append('passkey', passkey)
      form.append('technique', technique)
      const res = await api.post('/api/decode', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(res.data.message)
      toast.success('Message decoded! 🔓')
    } catch (err) {
      const detail = err.response?.data?.detail || 'Decoding failed'
      toast.error(detail)
    } finally {
      setDecoding(false)
    }
  }

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const reset = () => { setFile(null); setPasskey(''); setResult(null) }

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2">
              <span className="gradient-text">Decode</span> Message
            </h1>
            <p className="text-slate-500">Upload an encoded WAV file to reveal its hidden message.</p>
          </div>

          <div className="max-w-2xl space-y-6">
            {/* Upload */}
            <div className="glass-card p-7">
              <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-cyan-400" /> Upload Encoded Audio
              </h2>
              <p className="text-slate-500 text-sm mb-5">Select the WAV file that contains a hidden message.</p>
              <DropZone file={file} onFile={(f) => { setFile(f); setResult(null) }} />
              {file && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                  <Waveform file={file} />
                </motion.div>
              )}
            </div>

            {/* Passkey */}
            <div className="glass-card p-7">
              <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <Key className="w-5 h-5 text-cyan-400" /> Passkey
                <span className="text-slate-600 text-sm font-normal">(if message is protected)</span>
              </h2>
              <p className="text-slate-500 text-sm mb-4">Leave empty if no passkey was used during encoding.</p>
              <div className="relative">
                <input
                  id="decode-passkey"
                  type={showKey ? 'text' : 'password'}
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Enter passkey..."
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Decode Button */}
            <div className="glass-card p-7">
              <h2 className="text-lg font-bold text-white mb-1">Decoding Technique</h2>
              <p className="text-slate-500 text-sm mb-4">Choose the technique used during encoding.</p>
              <div className="grid gap-2">
                {TECHNIQUES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTechnique(t.id)}
                    className={`text-left rounded-xl border px-4 py-3 transition-colors ${
                      technique === t.id
                        ? 'border-cyan-400/70 bg-cyan-400/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <p className="text-sm font-semibold text-white">{t.label}</p>
                    <p className="text-xs text-slate-400 mt-1">{t.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Decode Button */}
            <motion.button
              id="decode-btn"
              onClick={handleDecode}
              disabled={decoding || !file}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
              whileTap={{ scale: 0.98 }}
            >
              {decoding ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Decoding...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Decode Hidden Message
                </>
              )}
            </motion.button>

            {/* Pulsing loader */}
            <AnimatePresence>
              {decoding && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex justify-center"
                >
                  <div className="flex gap-2 items-center text-slate-400 text-sm">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-cyan-400"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                    <span>Reading audio samples...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result */}
            <AnimatePresence>
              {result !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="glass-card p-7 border border-green-500/20"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center border border-green-500/30">
                        <MessageSquare className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm">Hidden Message Revealed</h3>
                        <p className="text-slate-500 text-xs">{result.length} characters decoded</p>
                      </div>
                    </div>
                    <button
                      onClick={handleCopy}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                        ${copied ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-slate-400 hover:text-white border border-white/10 hover:border-white/20'}`}
                    >
                      {copied ? <><CheckCircle className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                    </button>
                  </div>
                  <div className="bg-black/40 rounded-xl p-5 border border-white/10 min-h-[80px]">
                    <TypewriterText text={result} />
                  </div>
                  <button onClick={reset} className="btn-ghost mt-4 text-xs w-full text-center">
                    Decode Another File
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
