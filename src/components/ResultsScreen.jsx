import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'
import Confetti from 'react-confetti'
import { useState } from 'react'

export default function ResultsScreen() {
  const { state, startGame, setScreen } = useGame()
  const { session } = state
  const { correct, wrong, total, history } = session
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  const [windowSize] = useState({ width: window.innerWidth, height: window.innerHeight })

  const star = pct >= 80 ? '🏆' : pct >= 50 ? '🌟' : '💪'
  const msg = pct >= 80 ? '¡Campeón/a!' : pct >= 50 ? '¡Muy bien!' : '¡Sigue practicando!'

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-yellow-200 to-purple-200 p-6 overflow-y-auto">
      {pct >= 80 && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={300}
          recycle={false}
          gravity={0.3}
        />
      )}

      <motion.div
        className="w-full max-w-lg text-center mt-6"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 250 }}
      >
        <p className="text-9xl mb-2">{star}</p>
        <h1 className="font-kids text-6xl text-purple-700 text-shadow-kids mb-2">{msg}</h1>
        <p className="font-body text-2xl text-gray-600 mb-8">{total} palabras leídas</p>

        <div className="flex gap-6 justify-center mb-8">
          <div className="bg-green-100 border-2 border-green-400 rounded-2xl px-8 py-4 text-center">
            <p className="font-kids text-5xl text-green-600">{correct}</p>
            <p className="font-body text-lg text-green-700 font-bold">correctas ✅</p>
          </div>
          <div className="bg-red-100 border-2 border-red-400 rounded-2xl px-8 py-4 text-center">
            <p className="font-kids text-5xl text-red-500">{wrong}</p>
            <p className="font-body text-lg text-red-600 font-bold">incorrectas ❌</p>
          </div>
        </div>

        {/* Score circle */}
        <div className="flex justify-center mb-10">
          <svg width="140" height="140">
            <circle cx="70" cy="70" r="58" fill="none" stroke="#e9d5ff" strokeWidth="14" />
            <circle
              cx="70" cy="70" r="58"
              fill="none"
              stroke={pct >= 80 ? '#4ade80' : pct >= 50 ? '#facc15' : '#f87171'}
              strokeWidth="14"
              strokeDasharray={`${(pct / 100) * 364} 364`}
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
            />
            <text x="70" y="78" textAnchor="middle" fontSize="28" fontFamily="Fredoka One" fill="#4c1d95">
              {pct}%
            </text>
          </svg>
        </div>

        <div className="flex flex-col gap-4">
          <motion.button
            onClick={startGame}
            className="btn-press bg-green-400 hover:bg-green-500 text-white font-kids text-3xl px-10 py-5 rounded-3xl shadow-[0_6px_0_#16a34a]"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            ¡Jugar de nuevo! 🎮
          </motion.button>
          <motion.button
            onClick={() => setScreen('home')}
            className="btn-press bg-purple-400 hover:bg-purple-500 text-white font-kids text-2xl px-10 py-4 rounded-3xl shadow-[0_6px_0_#7e22ce]"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            Inicio 🏠
          </motion.button>
        </div>

        {/* Word history */}
        {history.length > 0 && (
          <div className="mt-10 text-left">
            <h2 className="font-kids text-3xl text-purple-600 mb-4">Historial</h2>
            <div className="flex flex-col gap-2">
              {history.map((h, i) => (
                <div key={i} className={`flex items-center gap-3 bg-white rounded-xl px-4 py-2 shadow-sm`}>
                  <span className="text-2xl">{h.correct ? '✅' : '❌'}</span>
                  <span className="font-body font-bold text-xl text-gray-700 flex-1">{h.word?.text}</span>
                  {h.timeout && <span className="text-orange-500 font-bold text-sm">tiempo</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
