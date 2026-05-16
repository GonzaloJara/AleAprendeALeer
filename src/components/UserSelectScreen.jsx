import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'

const COLORS = [
  'bg-red-200    text-red-700    shadow-[0_4px_0_#fca5a5]',
  'bg-blue-200   text-blue-700   shadow-[0_4px_0_#93c5fd]',
  'bg-green-200  text-green-700  shadow-[0_4px_0_#86efac]',
  'bg-yellow-200 text-yellow-700 shadow-[0_4px_0_#fde047]',
  'bg-pink-200   text-pink-700   shadow-[0_4px_0_#f9a8d4]',
  'bg-purple-200 text-purple-700 shadow-[0_4px_0_#d8b4fe]',
  'bg-orange-200 text-orange-700 shadow-[0_4px_0_#fdba74]',
  'bg-teal-200   text-teal-700   shadow-[0_4px_0_#5eead4]',
]

export default function UserSelectScreen() {
  const { state, setUser, setScreen } = useGame()
  const existingUsers = Object.keys(state.progress?.users ?? {})
  const [newName, setNewName] = useState('')

  const pick = (name) => { setUser(name); setScreen('home') }

  const addNew = () => {
    const name = newName.trim()
    if (!name) return
    pick(name)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-300 via-purple-200 to-yellow-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="text-center w-full max-w-md"
      >
        <p className="text-8xl mb-4">👋</p>
        <h1 className="font-kids text-5xl text-purple-700 mb-2">¿Quién eres?</h1>
        <p className="font-body text-purple-400 mb-8">Elige tu nombre para guardar tu progreso</p>

        {/* Existing users */}
        {existingUsers.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {existingUsers.map((name, i) => (
              <motion.button
                key={name}
                onClick={() => pick(name)}
                whileTap={{ scale: 0.95 }}
                className={`btn-press font-kids text-2xl px-8 py-4 rounded-3xl ${COLORS[i % COLORS.length]}`}
              >
                {name}
              </motion.button>
            ))}
          </div>
        )}

        {/* Add new user */}
        <div className="flex gap-3">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addNew()}
            placeholder={existingUsers.length ? 'Agregar otro nombre…' : 'Mi nombre es…'}
            className="flex-1 font-body text-xl border-2 border-purple-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-purple-500"
          />
          <motion.button
            onClick={addNew}
            whileTap={{ scale: 0.95 }}
            className="btn-press bg-purple-500 text-white font-kids text-xl px-6 py-3 rounded-2xl shadow-[0_4px_0_#7e22ce]"
          >
            ¡Listo!
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
