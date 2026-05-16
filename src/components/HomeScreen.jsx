import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'
import PinModal from './PinModal'

const emojis = ['📚', '⭐', '🌈', '🦋', '🎉', '🌟', '🎈', '🦄']

export default function HomeScreen() {
  const { setScreen, state } = useGame()
  const anim = state.settings.animationsEnabled !== false
  const userName = state.progress?.currentUser

  const [showPin, setShowPin] = useState(false)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-300 via-purple-200 to-yellow-100 p-6 stars-bg">

      {/* Floating emojis */}
      {anim && emojis.map((e, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl select-none pointer-events-none"
          style={{ top: `${10 + (i * 11) % 80}%`, left: `${5 + (i * 13) % 90}%` }}
          animate={{ y: [0, -15, 0], rotate: [-5, 5, -5] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {e}
        </motion.div>
      ))}

      {/* User badge — top right */}
      {userName && (
        <div className="absolute top-5 right-5 flex items-center gap-2 z-10">
          <span className="bg-white/70 backdrop-blur-sm font-body font-bold text-purple-700 px-4 py-2 rounded-full shadow text-base">
            👤 {userName}
          </span>
          <motion.button
            onClick={() => setScreen('user-select')}
            whileTap={{ scale: 0.9 }}
            className="bg-white/70 backdrop-blur-sm text-purple-400 hover:text-purple-600 font-body text-sm px-3 py-2 rounded-full shadow"
            title="Cambiar usuario"
          >
            ✏️
          </motion.button>
        </div>
      )}

      <motion.div
        className="relative z-10 text-center"
        initial={anim ? { opacity: 0, y: -40 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: anim ? 0.6 : 0, type: 'spring' }}
      >
        <motion.h1
          className="font-kids text-7xl md:text-8xl text-purple-600 text-shadow-kids mb-2"
          animate={anim ? { scale: [1, 1.03, 1] } : {}}
          transition={anim ? { duration: 2, repeat: Infinity } : {}}
        >
          Aprende
        </motion.h1>
        <motion.h1
          className="font-kids text-7xl md:text-8xl text-yellow-500 text-shadow-kids mb-8"
          animate={anim ? { scale: [1, 1.03, 1] } : {}}
          transition={anim ? { duration: 2, repeat: Infinity, delay: 0.3 } : {}}
        >
          a Leer 📖
        </motion.h1>

        <div className="flex flex-col gap-5 items-center mt-4">
          <motion.button
            onClick={() => setScreen('lesson-select')}
            className="btn-press bg-green-400 hover:bg-green-500 text-white font-kids text-4xl px-14 py-6 rounded-3xl shadow-[0_6px_0_#16a34a] w-72"
            whileHover={anim ? { scale: 1.05 } : {}}
            whileTap={anim ? { scale: 0.95 } : {}}
          >
            ¡Jugar! 🎮
          </motion.button>

          <motion.button
            onClick={() => setScreen('settings')}
            className="btn-press bg-blue-400 hover:bg-blue-500 text-white font-kids text-3xl px-12 py-5 rounded-3xl shadow-[0_6px_0_#1d4ed8] w-72"
            whileHover={anim ? { scale: 1.05 } : {}}
            whileTap={anim ? { scale: 0.95 } : {}}
          >
            Reglas ⚙️
          </motion.button>

          <motion.button
            onClick={() => setShowPin(true)}
            className="btn-press bg-orange-400 hover:bg-orange-500 text-white font-kids text-3xl px-12 py-5 rounded-3xl shadow-[0_6px_0_#c2410c] w-72"
            whileHover={anim ? { scale: 1.05 } : {}}
            whileTap={anim ? { scale: 0.95 } : {}}
          >
            Palabras 📝
          </motion.button>
        </div>
      </motion.div>

      {showPin && (
        <PinModal
          onSuccess={() => { setShowPin(false); setScreen('dashboard') }}
          onCancel={() => setShowPin(false)}
        />
      )}
    </div>
  )
}
