import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, FileAudio, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DropZone({ onFile, accept = '.wav', file }) {
  const [dragging, setDragging] = useState(false)

  const handleFile = useCallback((f) => {
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.wav')) {
      toast.error('Only WAV files are supported!')
      return
    }
    onFile(f)
  }, [onFile])

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    handleFile(f)
  }

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const onInputChange = (e) => {
    const f = e.target.files[0]
    handleFile(f)
    e.target.value = ''
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {file ? (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-5 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400/20 to-purple-600/20 flex items-center justify-center border border-cyan-400/30">
              <FileAudio className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate text-sm">{file.name}</p>
              <p className="text-slate-500 text-xs mt-0.5">{formatSize(file.size)}</p>
            </div>
            <button
              onClick={() => onFile(null)}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <motion.label
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`flex flex-col items-center justify-center gap-4 w-full min-h-[180px] rounded-2xl
              border-2 border-dashed cursor-pointer transition-all duration-300
              ${dragging
                ? 'drop-zone-active border-cyan-400'
                : 'border-white/20 hover:border-cyan-400/40 hover:bg-cyan-400/5'
              }`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
          >
            <input
              type="file"
              accept={accept}
              onChange={onInputChange}
              className="hidden"
            />
            <motion.div
              animate={dragging ? { scale: 1.1 } : { scale: 1 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/10 to-purple-600/10 flex items-center justify-center border border-white/10"
            >
              <UploadCloud className={`w-8 h-8 ${dragging ? 'text-cyan-400' : 'text-slate-400'} transition-colors`} />
            </motion.div>
            <div className="text-center">
              <p className="text-white font-medium">Drop your WAV file here</p>
              <p className="text-slate-500 text-sm mt-1">or <span className="text-cyan-400">browse to upload</span></p>
              <p className="text-slate-600 text-xs mt-2">WAV format only • Lossless quality</p>
            </div>
          </motion.label>
        )}
      </AnimatePresence>
    </div>
  )
}
