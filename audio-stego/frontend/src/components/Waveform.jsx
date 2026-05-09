import { useEffect, useRef } from 'react'
import WaveSurfer from 'wavesurfer.js'

export default function Waveform({ file, onReady }) {
  const containerRef = useRef(null)
  const wavesurferRef = useRef(null)

  useEffect(() => {
    if (!file || !containerRef.current) return

    // Destroy previous instance
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy()
    }

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgba(0, 212, 255, 0.4)',
      progressColor: '#00d4ff',
      cursorColor: '#7c3aed',
      barWidth: 2,
      barRadius: 2,
      barGap: 1,
      height: 80,
      normalize: true,
      backend: 'WebAudio',
    })

    wavesurferRef.current = ws

    const url = URL.createObjectURL(file)
    ws.load(url)
    ws.on('ready', () => {
      const duration = ws.getDuration()
      if (onReady) onReady(duration)
      URL.revokeObjectURL(url)
    })

    return () => {
      ws.destroy()
    }
  }, [file])

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl overflow-hidden"
      style={{ background: 'rgba(0,212,255,0.03)', padding: '8px' }}
    />
  )
}
