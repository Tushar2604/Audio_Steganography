import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { SignInButton, useAuth } from '@clerk/react'
import { Shield, Lock, Send, Unlock, ChevronRight, Github } from 'lucide-react'

const AnimatedWave = () => (
  <div className="flex items-end gap-1 h-16">
    {Array.from({ length: 20 }).map((_, i) => (
      <motion.div
        key={i}
        className="w-1.5 rounded-full"
        style={{
          background: i % 3 === 0 ? '#00d4ff' : i % 3 === 1 ? '#7c3aed' : '#00d4ff88',
          minHeight: 4,
        }}
        animate={{ height: [8, Math.random() * 50 + 10, 8] }}
        transition={{
          duration: 1.2 + Math.random() * 0.8,
          repeat: Infinity,
          delay: i * 0.05,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
)

const Particle = ({ style }) => (
  <motion.div
    className="absolute rounded-full opacity-0"
    style={{ ...style, background: 'radial-gradient(circle, rgba(0,212,255,0.4), transparent)' }}
    animate={{ y: [-20, -400], opacity: [0, 0.6, 0] }}
    transition={{ duration: 8 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5 }}
  />
)

const features = [
  {
    icon: Lock,
    title: 'LSB Encoding',
    desc: 'Your message is hidden bit-by-bit in audio samples — invisible to the human ear.',
    color: 'from-cyan-400/20 to-cyan-400/5',
    border: 'border-cyan-400/20',
    glow: 'text-cyan-400',
  },
  {
    icon: Unlock,
    title: 'Instant Decode',
    desc: 'Upload any encoded WAV and extract the hidden message in milliseconds.',
    color: 'from-purple-600/20 to-purple-600/5',
    border: 'border-purple-600/20',
    glow: 'text-purple-400',
  },
  {
    icon: Send,
    title: 'Secure Delivery',
    desc: 'Send your encoded audio directly to any email. The secret travels undetected.',
    color: 'from-green-500/20 to-green-500/5',
    border: 'border-green-500/20',
    glow: 'text-green-400',
  },
]

const steps = [
  { num: '01', title: 'Upload Audio', desc: 'Choose any WAV file as your carrier.' },
  { num: '02', title: 'Hide Message', desc: 'We flip the least-significant bit of each audio sample to encode your text.' },
  { num: '03', title: 'Download & Send', desc: 'Get your encoded file — sounds identical, but carries a secret.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()

  return (
    <div className="min-h-screen bg-bg overflow-x-hidden">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-bg/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center neon-glow">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">AudioStego</span>
        </div>
        <div className="flex items-center gap-3">
          {!isSignedIn && (
            <SignInButton mode="modal">
              <button className="btn-secondary text-sm px-5 py-2.5">Sign In</button>
            </SignInButton>
          )}
          {isSignedIn && (
            <button onClick={() => navigate('/dashboard')} className="btn-primary text-sm px-5 py-2.5">Open Workspace</button>
          )}
          {!isSignedIn && (
            <SignInButton mode="modal">
              <button className="btn-primary text-sm px-5 py-2.5">Get Started</button>
            </SignInButton>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 text-center overflow-hidden">
        {/* Background particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <Particle
            key={i}
            style={{
              left: `${Math.random() * 100}%`,
              bottom: 0,
              width: Math.random() * 6 + 2,
              height: Math.random() * 6 + 2,
            }}
          />
        ))}

        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(ellipse, #00d4ff, transparent 60%)' }} />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(ellipse, #7c3aed, transparent 60%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-sm font-medium mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Shield className="w-4 h-4" />
            Military-grade audio steganography
          </motion.div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6">
            Hide Your Secrets
            <br />
            <span className="gradient-text">in Plain Sound</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Embed invisible text messages inside audio files using LSB steganography.
            Undetectable. Lossless. Secure.
          </p>

          {/* Waveform animation */}
          <div className="flex justify-center mb-10">
            <AnimatedWave />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={() => navigate('/encode')}
              className="btn-primary text-base px-8 py-4 flex items-center gap-2 justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Hiding Messages <ChevronRight className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={() => navigate('/decode')}
              className="btn-secondary text-base px-8 py-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Decode Message
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-black mb-4 gradient-text">Everything You Need</h2>
          <p className="text-slate-400 text-lg">Powerful steganography tools wrapped in a clean interface.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, color, border, glow }, i) => (
            <motion.div
              key={i}
              className={`glass-card p-8 bg-gradient-to-br ${color} border ${border} hover:scale-105 transition-transform duration-300 cursor-default`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-5 border ${border}`}>
                <Icon className={`w-7 h-7 ${glow}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
              <p className="text-slate-400 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 bg-surface/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-black mb-4 gradient-text">How LSB Steganography Works</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              The Least Significant Bit method replaces the last bit of each audio sample byte —
              a change so tiny the human ear cannot detect it.
            </p>
          </motion.div>

          {/* Visual LSB explanation */}
          <motion.div
            className="glass-card p-8 mb-12 overflow-x-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-center">
              <div>
                <p className="text-slate-500 text-xs mb-2 uppercase tracking-widest">Original Sample</p>
                <div className="flex gap-1">
                  {'10110110'.split('').map((bit, j) => (
                    <div key={j} className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-mono font-bold border
                      ${j === 7 ? 'bg-slate-700/50 border-slate-600 text-slate-300' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                      {bit}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-3xl text-cyan-400 font-light hidden sm:block">→</div>
              <div>
                <p className="text-cyan-400 text-xs mb-2 uppercase tracking-widest">LSB Changed to '1'</p>
                <div className="flex gap-1">
                  {'10110111'.split('').map((bit, j) => (
                    <div key={j} className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-mono font-bold border
                      ${j === 7 ? 'bg-cyan-400/20 border-cyan-400/50 text-cyan-400 shadow-[0_0_12px_rgba(0,212,255,0.3)]' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                      {bit}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <p className="text-slate-500 text-xs mb-1">Audio value change</p>
                <p className="text-2xl font-bold text-green-400">182 → 183</p>
                <p className="text-slate-600 text-xs">≈ 0.4% change • Inaudible</p>
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(({ num, title, desc }, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="text-6xl font-black gradient-text opacity-30 mb-3">{num}</div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-4xl font-black mb-4">
            Ready to Hide a <span className="gradient-text">Secret?</span>
          </h2>
          <p className="text-slate-400 mb-8">Sign in and keep your encoded history private to your workspace.</p>
          {isSignedIn ? (
            <button
              onClick={() => navigate('/encode')}
              className="btn-primary text-lg px-10 py-4"
            >
              Start Encoding
            </button>
          ) : (
            <SignInButton mode="modal">
              <button className="btn-primary text-lg px-10 py-4">Create Your Workspace</button>
            </SignInButton>
          )}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-slate-600 text-sm">
        <p>© 2025 AudioStego · Built with LSB Steganography · Your secrets stay yours</p>
      </footer>
    </div>
  )
}
