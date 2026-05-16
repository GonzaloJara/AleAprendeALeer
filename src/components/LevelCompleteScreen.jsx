import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'
import Confetti from 'react-confetti'

export default function LevelCompleteScreen() {
  const { state, startGame, setScreen } = useGame()
  const { progress, settings, lessons } = state
  const [windowSize] = useState({ width: window.innerWidth, height: window.innerHeight })

  const userName  = progress?.currentUser ?? null
  const lesson    = lessons.find(l => l.id === settings.lessonId)
  const lessonName = lesson?.name ?? 'esta lección'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-yellow-200 via-orange-100 to-purple-200 p-6">
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        numberOfPieces={450}
        recycle={false}
        gravity={0.22}
      />

      <motion.div
        className="text-center z-10"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 14 }}
      >
        <motion.p
          className="text-9xl mb-4 select-none"
          animate={{ rotate: [-12, 12, -8, 8, 0], scale: [1, 1.25, 1] }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          🏆
        </motion.p>

        <h1 className="font-kids text-6xl text-purple-700 mb-3 text-shadow-kids">¡Nivel completado!</h1>

        {userName && (
          <p className="font-kids text-4xl text-orange-600 mb-1">{userName}</p>
        )}
        <p className="font-body text-2xl text-gray-600 mb-10">
          completó la lección <strong>{lessonName}</strong> 🌟
        </p>

        <div className="flex flex-col gap-4 items-center">
          <motion.button
            onClick={startGame}
            whileTap={{ scale: 0.95 }}
            className="btn-press bg-green-400 hover:bg-green-500 text-white font-kids text-3xl px-12 py-5 rounded-3xl shadow-[0_6px_0_#16a34a] w-80"
          >
            Seguir practicando 🎮
          </motion.button>
          <motion.button
            onClick={() => setScreen('lesson-select')}
            whileTap={{ scale: 0.95 }}
            className="btn-press bg-purple-400 hover:bg-purple-500 text-white font-kids text-2xl px-12 py-4 rounded-3xl shadow-[0_6px_0_#7e22ce] w-80"
          >
            Otra lección 📚
          </motion.button>
          <motion.button
            onClick={() => setScreen('home')}
            whileTap={{ scale: 0.95 }}
            className="btn-press bg-gray-200 hover:bg-gray-300 text-gray-600 font-kids text-2xl px-12 py-4 rounded-3xl shadow-[0_4px_0_#9ca3af] w-80"
          >
            Inicio 🏠
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
