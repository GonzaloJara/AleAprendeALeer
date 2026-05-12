import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../context/GameContext'

const TYPE_LABELS = { silaba: 'Sílaba', palabra: 'Palabra', frase: 'Frase' }
const TYPE_COLORS = {
  silaba: 'bg-blue-100 text-blue-700 border-blue-300',
  palabra: 'bg-green-100 text-green-700 border-green-300',
  frase: 'bg-orange-100 text-orange-700 border-orange-300',
}

function WordCard({ word, onToggle, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-md border-2 transition-colors ${
        word.active === false ? 'opacity-50 border-gray-200' : 'border-purple-100'
      }`}
    >
      <button onClick={() => onToggle(word.id)} className="text-2xl">
        {word.active === false ? '🔴' : '🟢'}
      </button>
      <span className="flex-1 font-body font-bold text-xl text-gray-800 truncate">{word.text}</span>
      <span className={`font-body text-sm font-bold px-2 py-1 rounded-full border ${TYPE_COLORS[word.type] || 'bg-gray-100 text-gray-600 border-gray-300'}`}>
        {TYPE_LABELS[word.type] || word.type}
      </span>
      <span className="text-yellow-500 text-lg">{'⭐'.repeat(word.level || 1)}</span>
      <button
        onClick={() => onDelete(word.id)}
        className="text-red-400 hover:text-red-600 text-xl font-bold ml-1"
      >
        ×
      </button>
    </motion.div>
  )
}

export default function DashboardScreen() {
  const { state, updateWords, resetWords, setScreen } = useGame()
  const { words } = state

  const [newText, setNewText] = useState('')
  const [newType, setNewType] = useState('palabra')
  const [newLevel, setNewLevel] = useState(1)
  const [filter, setFilter] = useState('todas')
  const [search, setSearch] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)

  const filtered = words.filter(w => {
    if (filter !== 'todas' && w.type !== filter) return false
    if (search && !w.text.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const addWord = () => {
    const text = newText.trim()
    if (!text) return
    const id = `custom_${Date.now()}`
    updateWords([...words, { id, text, type: newType, level: newLevel, active: true }])
    setNewText('')
  }

  const toggleWord = (id) => {
    updateWords(words.map(w => w.id === id ? { ...w, active: w.active === false ? true : false } : w))
  }

  const deleteWord = (id) => {
    updateWords(words.filter(w => w.id !== id))
  }

  const handleReset = () => {
    if (confirmReset) { resetWords(); setConfirmReset(false) }
    else setConfirmReset(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 to-yellow-50 p-5">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <motion.button
            onClick={() => setScreen('home')}
            className="btn-press bg-gray-200 hover:bg-gray-300 text-gray-700 font-kids text-2xl px-5 py-3 rounded-2xl shadow-[0_4px_0_#9ca3af]"
            whileTap={{ scale: 0.95 }}
          >
            ← Volver
          </motion.button>
          <h1 className="font-kids text-4xl text-orange-600">Mis Palabras 📝</h1>
          <span className="ml-auto bg-orange-200 text-orange-700 font-bold rounded-full px-3 py-1">
            {words.filter(w => w.active !== false).length} activas
          </span>
        </div>

        {/* Add new word */}
        <div className="bg-white rounded-2xl p-5 shadow-md mb-5">
          <p className="font-kids text-2xl text-purple-700 mb-3">Agregar palabra ✏️</p>
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addWord()}
              placeholder="Escribe una palabra o frase..."
              className="flex-1 min-w-48 font-body text-xl border-2 border-purple-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
            />
            <select
              value={newType}
              onChange={e => setNewType(e.target.value)}
              className="font-body font-bold text-lg border-2 border-purple-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
            >
              <option value="silaba">Sílaba</option>
              <option value="palabra">Palabra</option>
              <option value="frase">Frase</option>
            </select>
            <select
              value={newLevel}
              onChange={e => setNewLevel(Number(e.target.value))}
              className="font-body font-bold text-lg border-2 border-purple-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
            >
              <option value={1}>⭐ Fácil</option>
              <option value={2}>⭐⭐ Normal</option>
              <option value={3}>⭐⭐⭐ Difícil</option>
            </select>
            <motion.button
              onClick={addWord}
              className="btn-press bg-purple-500 hover:bg-purple-600 text-white font-kids text-xl px-6 py-3 rounded-xl shadow-[0_4px_0_#7e22ce]"
              whileTap={{ scale: 0.95 }}
            >
              Agregar +
            </motion.button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap mb-4">
          {['todas', 'silaba', 'palabra', 'frase'].map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`font-body font-bold text-lg px-4 py-2 rounded-full border-2 transition-colors ${
                filter === t ? 'bg-orange-400 text-white border-orange-600' : 'bg-white text-orange-600 border-orange-200'
              }`}
            >
              {t === 'todas' ? 'Todas' : TYPE_LABELS[t]}
            </button>
          ))}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="font-body text-lg border-2 border-orange-200 rounded-full px-4 py-2 focus:outline-none focus:border-orange-400 flex-1 min-w-32"
          />
        </div>

        {/* Word list */}
        <div className="flex flex-col gap-3 max-h-[55vh] overflow-y-auto pr-1">
          <AnimatePresence>
            {filtered.map(w => (
              <WordCard key={w.id} word={w} onToggle={toggleWord} onDelete={deleteWord} />
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <p className="text-center font-body text-gray-400 text-xl py-8">No hay palabras 😅</p>
          )}
        </div>

        {/* Reset button */}
        <motion.button
          onClick={handleReset}
          className={`btn-press mt-6 w-full font-kids text-xl py-4 rounded-2xl shadow-[0_4px_0_#dc2626] ${
            confirmReset ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'
          }`}
          whileTap={{ scale: 0.97 }}
        >
          {confirmReset ? '¿Seguro? Toca de nuevo para confirmar 🗑️' : 'Restablecer palabras originales 🔄'}
        </motion.button>
      </div>
    </div>
  )
}
