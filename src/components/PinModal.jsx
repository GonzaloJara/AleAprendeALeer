import { useState } from 'react'
import { motion } from 'framer-motion'

const CORRECT_PIN = '7858'

export default function PinModal({ onSuccess, onCancel }) {
  const [digits, setDigits] = useState([])
  const [shake,  setShake]  = useState(false)
  const [error,  setError]  = useState(false)

  const press = (d) => {
    if (digits.length >= 4) return
    const next = [...digits, d]
    setDigits(next)
    if (next.length === 4) {
      if (next.join('') === CORRECT_PIN) {
        onSuccess()
      } else {
        setShake(true)
        setError(true)
        setTimeout(() => { setDigits([]); setShake(false); setError(false) }, 650)
      }
    }
  }

  const del = () => setDigits(d => d.slice(0, -1))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        animate={shake ? { x: [-12, 12, -10, 10, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl p-8 shadow-2xl w-80 flex flex-col items-center gap-6"
      >
        <p className="font-kids text-2xl text-purple-700">🔐 Código de acceso</p>

        {/* Indicator dots */}
        <div className="flex gap-4">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full border-2 transition-all ${
                i < digits.length
                  ? error ? 'bg-red-400 border-red-400' : 'bg-purple-500 border-purple-500'
                  : 'bg-white border-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Numeric keypad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <motion.button
              key={n}
              onClick={() => press(String(n))}
              whileTap={{ scale: 0.88 }}
              className="btn-press bg-purple-50 hover:bg-purple-100 text-purple-700 font-kids text-3xl py-4 rounded-2xl shadow-[0_3px_0_#d8b4fe]"
            >
              {n}
            </motion.button>
          ))}
          {/* Bottom row: cancel | 0 | backspace */}
          <motion.button
            onClick={onCancel}
            whileTap={{ scale: 0.88 }}
            className="btn-press bg-gray-100 hover:bg-gray-200 text-gray-500 font-kids text-xl py-4 rounded-2xl shadow-[0_3px_0_#d1d5db]"
          >
            ✕
          </motion.button>
          <motion.button
            onClick={() => press('0')}
            whileTap={{ scale: 0.88 }}
            className="btn-press bg-purple-50 hover:bg-purple-100 text-purple-700 font-kids text-3xl py-4 rounded-2xl shadow-[0_3px_0_#d8b4fe]"
          >
            0
          </motion.button>
          <motion.button
            onClick={del}
            whileTap={{ scale: 0.88 }}
            className="btn-press bg-red-50 hover:bg-red-100 text-red-400 font-kids text-2xl py-4 rounded-2xl shadow-[0_3px_0_#fca5a5]"
          >
            ⌫
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
