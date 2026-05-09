import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UploadCloud, MessageSquare, Download, Send, FileAudio,
  ChevronRight, ChevronLeft, Loader2, CheckCircle, Key, Eye, EyeOff, Info
} from 'lucide-react'
import toast from 'react-hot-toast'
import Sidebar from '../components/Sidebar'
import DropZone from '../components/DropZone'
import Waveform from '../components/Waveform'
import StepIndicator from '../components/StepIndicator'
import SendModal from '../components/SendModal'
import api from '../api/axios'

const STEPS = ['Upload Audio', 'Secret Message', 'Encode & Export']
const TECHNIQUES = [
  { id: 'lsb', label: 'Basic (LSB)', hint: 'High capacity and fast embedding' },
  { id: 'phase', label: 'Advanced (Phase Encoding)', hint: 'Phase-based embedding with lower capacity' },
]

export default function Encode() {
  const [step, setStep] = useState(0)
  const [file, setFile] = useState(null)
  const [duration, setDuration] = useState(null)
  const [message, setMessage] = useState('')
  const [passkey, setPasskey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [encoding, setEncoding] = useState(false)
  const [result, setResult] = useState(null) // { file_id, filename, file_size }
  const [showSend, setShowSend] = useState(false)
  const [technique, setTechnique] = useState('lsb')

  const capacity = file ? Math.floor((file.size - 44) / 8) : 0
  const charCount = message.length
  const capacityPct = capacity > 0 ? Math.min((charCount / capacity) * 100, 100) : 0

  const handleEncode = async () => {
    if (!file) { toast.error('Please upload a WAV file'); return }
    if (!message.trim()) { toast.error('Message cannot be empty'); return }
    if (charCount > capacity) { toast.error('Message exceeds audio capacity!'); return }

    setEncoding(true)
    try {
      const form = new FormData()
      form.append('audio_file', file)
      form.append('secret_message', message)
      form.append('passkey', passkey)
      form.append('technique', technique)

      const res = await api.post('/api/encode', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(res.data)
      setStep(2)
      toast.success('Message encoded successfully! 🔐')
    } catch (err) {
      const detail = err.response?.data?.detail || 'Encoding failed'
      toast.error(detail)
    } finally {
      setEncoding(false)
    }
  }

  const handleDownload = async () => {
    if (!result) return
    try {
      const res = await api.get(`/api/files/${result.file_id}/download`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `encoded_${file?.name || 'audio.wav'}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Download started!')
    } catch {
      toast.error('Download failed')
    }
  }

  const reset = () => {
    setStep(0); setFile(null); setDuration(null)
    setMessage(''); setPasskey(''); setResult(null)
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2">
              <span className="gradient-text">Encode</span> Message
            </h1>
            <p className="text-slate-500">Hide a secret text inside a WAV audio file using LSB steganography.</p>
          </div>

          <div className="max-w-2xl">
            <StepIndicator steps={STEPS} current={step} />
          </div>

          <div className="max-w-2xl mt-12">
            <AnimatePresence mode="wait">
              {/* STEP 0: Upload */}
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                  className="space-y-6"
                >
                  <div className="glass-card p-7">
                    <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                      <UploadCloud className="w-5 h-5 text-cyan-400" /> Upload Audio File
                    </h2>
                    <p className="text-slate-500 text-sm mb-5">Select a WAV file to use as the carrier.</p>
                    <DropZone file={file} onFile={setFile} />
                    {file && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                        <Waveform file={file} onReady={setDuration} />
                        <div className="flex gap-4 mt-3 text-sm text-slate-400">
                          {duration && <span>⏱ {duration.toFixed(1)}s</span>}
                          <span>📦 {(file.size / 1024).toFixed(0)} KB</span>
                          <span className="text-cyan-400">Max: {capacity} chars</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => { if (!file) { toast.error('Upload a WAV file first'); return } setStep(1) }}
                      className="btn-primary flex items-center gap-2"
                    >
                      Next Step <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 1: Message */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                  className="space-y-6"
                >
                  <div className="glass-card p-7">
                    <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-cyan-400" /> Enter Secret Message
                    </h2>
                    <p className="text-slate-500 text-sm mb-5">This text will be invisibly embedded in the audio.</p>

                    <textarea
                      id="secret-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your secret message here..."
                      rows={5}
                      className="input-field resize-none"
                    />

                    {/* Capacity bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>{charCount} chars</span>
                        <span>Max: {capacity} chars</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full transition-all ${capacityPct > 90 ? 'bg-red-500' : capacityPct > 70 ? 'bg-yellow-500' : 'bg-gradient-to-r from-cyan-400 to-purple-600'}`}
                          style={{ width: `${capacityPct}%` }}
                        />
                      </div>
                      {capacityPct > 90 && (
                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                          <Info className="w-3 h-3" /> Approaching audio capacity limit!
                        </p>
                      )}
                    </div>

                    {/* Passkey */}
                    <div className="mt-5">
                      <label className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-1.5">
                        <Key className="w-4 h-4 text-cyan-400" /> Passkey
                        <span className="text-slate-600 text-xs">(optional)</span>
                      </label>
                      <div className="relative">
                        <input
                          id="encode-passkey"
                          type={showKey ? 'text' : 'password'}
                          value={passkey}
                          onChange={(e) => setPasskey(e.target.value)}
                          placeholder="Add a passkey for extra protection..."
                          className="input-field pr-10"
                        />
                        <button type="button" onClick={() => setShowKey(!showKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                          {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Technique */}
                    <div className="mt-5">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Encoding Technique
                      </label>
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
                  </div>
                  <div className="flex gap-3 justify-between">
                    <button onClick={() => setStep(0)} className="btn-secondary flex items-center gap-2">
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      onClick={handleEncode}
                      disabled={encoding || !message.trim()}
                      className="btn-primary flex items-center gap-2"
                    >
                      {encoding ? <><Loader2 className="w-4 h-4 animate-spin" /> Encoding...</> : <>Encode Message <ChevronRight className="w-4 h-4" /></>}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Result */}
              {step === 2 && result && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="glass-card p-8 text-center">
                    <motion.div
                      className="w-20 h-20 mx-auto rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center mb-5"
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <CheckCircle className="w-10 h-10 text-green-400" />
                    </motion.div>
                    <h2 className="text-2xl font-black text-white mb-2">Encoding Complete!</h2>
                    <p className="text-slate-400 mb-6">Your secret message is now hidden inside the audio file.</p>

                    <div className="glass-card-dark p-4 mb-6 text-left">
                      <div className="flex items-center gap-3">
                        <FileAudio className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-white text-sm font-medium">{file?.name}</p>
                          <p className="text-slate-500 text-xs">{(result.file_size / 1024).toFixed(0)} KB · Encoded WAV</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button onClick={handleDownload} className="btn-primary flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" /> Download File
                      </button>
                      <button onClick={() => setShowSend(true)} className="btn-secondary flex items-center justify-center gap-2">
                        <Send className="w-4 h-4" /> Send via Email
                      </button>
                    </div>
                    <button onClick={reset} className="btn-ghost mt-4 text-sm">Encode Another</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      {showSend && (
        <SendModal
          file={file}
          fileId={result?.file_id}
          onClose={() => setShowSend(false)}
        />
      )}
    </div>
  )
}
