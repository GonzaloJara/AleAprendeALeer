import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import Confetti from 'react-confetti'

const PRAISE = ['¡Muy bien! 🌟', '¡Excelente! 🎉', '¡Bravo! 🥳', '¡Genial! ⭐', '¡Súper! 🦄', '¡Correcto! 🎊']
const STARS = ['⭐', '🌟', '✨', '💫']
const WRONG_MSG = ['¡Inténtalo de nuevo! 💪', '¡Casi! 🤗', '¡Sigue intentando! 🌈']

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function FloatingStar({ emoji, x, y, delay }) {
  return (
    <motion.div
      className="absolute text-5xl pointer-events-none select-none"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0, y: 0 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.5, 1.2, 0], y: -120 }}
      transition={{ duration: 1.2, delay, ease: 'easeOut' }}
    >
      {emoji}
    </motion.div>
  )
}

export default function SuccessAnimation({ type, onDone }) {
  const [msg] = useState(() => type === 'correct' ? randomPick(PRAISE) : randomPick(WRONG_MSG))
  const [windowSize] = useState({ width: window.innerWidth, height: window.innerHeight })

  useEffect(() => {
    const t = setTimeout(onDone, type === 'correct' ? 1800 : 1200)
    return () => clearTimeout(t)
  }, [onDone, type])

  const stars = type === 'correct'
    ? Array.from({ length: 8 }, (_, i) => ({
        emoji: randomPick(STARS),
        x: 10 + (i * 12) % 80,
        y: 20 + (i * 15) % 60,
        delay: i * 0.1,
      }))
    : []

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {type === 'correct' && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            numberOfPieces={200}
            recycle={false}
            gravity={0.4}
            colors={['#ff69b4', '#ffd700', '#87ceeb', '#98fb98', '#dda0dd', '#ff6347']}
          />
        )}

        {stars.map((s, i) => (
          <FloatingStar key={i} {...s} />
        ))}

        <motion.div
          className={`rounded-3xl px-14 py-8 text-center shadow-2xl ${
            type === 'correct'
              ? 'bg-green-400 border-4 border-green-600'
              : 'bg-red-400 border-4 border-red-600'
          }`}
          initial={{ scale: 0, rotate: -10 }}
          animate={type === 'correct'
            ? { scale: [0, 1.3, 1], rotate: [0, 5, -5, 0] }
            : { scale: [0, 1.1, 1], rotate: [0, -5, 5, 0] }
          }
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <p className="font-kids text-5xl text-white text-shadow-kids">{msg}</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
