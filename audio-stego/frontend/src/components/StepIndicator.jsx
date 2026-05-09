import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export default function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'idle'
        return (
          <div key={i} className="flex items-center">
            {/* Circle */}
            <motion.div
              className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm transition-all duration-500
                ${state === 'active'
                  ? 'bg-gradient-to-br from-cyan-400 to-purple-600 border-transparent text-white shadow-[0_0_20px_rgba(0,212,255,0.5)]'
                  : state === 'done'
                  ? 'bg-green-500/20 border-green-500 text-green-400'
                  : 'bg-white/5 border-white/20 text-slate-500'
                }`}
              animate={state === 'active' ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {state === 'done' ? <Check className="w-4 h-4" /> : i + 1}
            </motion.div>

            {/* Label below */}
            <div className="absolute mt-16 transform -translate-x-1/2 hidden sm:block" style={{ marginLeft: -20 }}>
              <p className={`text-xs whitespace-nowrap font-medium ${state === 'active' ? 'text-cyan-400' : state === 'done' ? 'text-green-400' : 'text-slate-600'}`}>
                {step}
              </p>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-16 sm:w-24 mx-1 transition-all duration-500 ${i < current ? 'bg-gradient-to-r from-green-500 to-cyan-400' : 'bg-white/10'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
