import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../context/GameContext'

const TYPE_LABELS  = { silaba: 'Sílaba', palabra: 'Palabra', frase: 'Frase' }
const TYPE_COLORS  = {
  silaba:  'bg-blue-100 text-blue-700 border-blue-300',
  palabra: 'bg-green-100 text-green-700 border-green-300',
  frase:   'bg-orange-100 text-orange-700 border-orange-300',
}
const LESSON_COLORS = [
  'bg-red-100 text-red-700',
  'bg-orange-100 text-orange-700',
  'bg-yellow-100 text-yellow-700',
  'bg-green-100 text-green-700',
  'bg-teal-100 text-teal-700',
  'bg-blue-100 text-blue-700',
  'bg-indigo-100 text-indigo-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
  'bg-rose-100 text-rose-700',
]

function lessonColor(lessons, lessonId) {
  const idx = lessons.findIndex(l => l.id === lessonId)
  return LESSON_COLORS[idx % LESSON_COLORS.length] ?? 'bg-gray-100 text-gray-600'
}

function WordCard({ word, lessonName, colorClass, onToggle, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-md border-2 ${
        word.active === false ? 'opacity-50 border-gray-200' : 'border-purple-100'
      }`}
    >
      <button onClick={() => onToggle(word.id)} className="text-2xl shrink-0">
        {word.active === false ? '🔴' : '🟢'}
      </button>
      <span className="flex-1 font-body font-bold text-xl text-gray-800 truncate min-w-0">{word.text}</span>
      <span className={`font-body text-xs font-bold px-2 py-1 rounded-full shrink-0 ${colorClass}`}>
        {lessonName}
      </span>
      <span className={`font-body text-xs font-bold px-2 py-1 rounded-full border shrink-0 ${TYPE_COLORS[word.type] ?? 'bg-gray-100 text-gray-600 border-gray-300'}`}>
        {TYPE_LABELS[word.type] ?? word.type}
      </span>
      <button onClick={() => onDelete(word.id)} className="text-red-400 hover:text-red-600 text-xl font-bold shrink-0">×</button>
    </motion.div>
  )
}

export default function DashboardScreen() {
  const { state, updateWords, updateLessons, setScreen } = useGame()
  const { words, lessons } = state

  const sortedLessons = [...lessons].sort((a, b) => a.sort_order - b.sort_order)
  const lessonMap = Object.fromEntries(lessons.map(l => [l.id, l]))

  // ── Add word ──
  const [newText,    setNewText]    = useState('')
  const [newType,    setNewType]    = useState('palabra')
  const [newLesson,  setNewLesson]  = useState(sortedLessons[0]?.id ?? '')

  // ── Add lesson ──
  const [showAddLesson, setShowAddLesson] = useState(false)
  const [lessonName,    setLessonName]    = useState('')
  const [lessonLetters, setLessonLetters] = useState('')

  // ── Filters ──
  const [filterLesson, setFilterLesson] = useState('todas')
  const [filterType,   setFilterType]   = useState('todas')
  const [search,       setSearch]       = useState('')

  const filtered = words.filter(w => {
    if (filterLesson !== 'todas' && w.lesson_id !== filterLesson) return false
    if (filterType   !== 'todas' && w.type !== filterType)        return false
    if (search && !w.text.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const addWord = () => {
    const text = newText.trim()
    if (!text || !newLesson) return
    updateWords([...words, { id: `custom_${Date.now()}`, text, type: newType, lesson_id: newLesson, active: true }])
    setNewText('')
  }

  const addLesson = () => {
    const name = lessonName.trim()
    if (!name) return
    const letters = lessonLetters.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    const maxOrder = Math.max(0, ...lessons.map(l => l.sort_order))
    const id = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    updateLessons([...lessons, { id, name, new_letters: letters, sort_order: maxOrder + 1 }])
    setLessonName('')
    setLessonLetters('')
    setShowAddLesson(false)
  }

  const toggleWord  = (id) => updateWords(words.map(w => w.id === id ? { ...w, active: w.active === false } : w))
  const deleteWord  = (id) => updateWords(words.filter(w => w.id !== id))
  const deleteLesson = (id) => {
    updateLessons(lessons.filter(l => l.id !== id))
    updateWords(words.filter(w => w.lesson_id !== id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 to-yellow-50 p-5">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <motion.button onClick={() => setScreen('home')}
            className="btn-press bg-gray-200 hover:bg-gray-300 text-gray-700 font-kids text-2xl px-5 py-3 rounded-2xl shadow-[0_4px_0_#9ca3af]"
            whileTap={{ scale: 0.95 }}>
            ← Volver
          </motion.button>
          <h1 className="font-kids text-4xl text-orange-600">Mis Palabras 📝</h1>
          <span className="ml-auto bg-orange-200 text-orange-700 font-bold rounded-full px-3 py-1 text-sm">
            {words.filter(w => w.active !== false).length} activas
          </span>
        </div>

        {/* Lessons list */}
        <div className="bg-white rounded-2xl p-5 shadow-md mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-kids text-2xl text-purple-700">Lecciones 📚</p>
            <button onClick={() => setShowAddLesson(v => !v)}
              className="font-kids text-lg bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-xl">
              {showAddLesson ? 'Cancelar' : '+ Nueva'}
            </button>
          </div>

          <AnimatePresence>
            {showAddLesson && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="flex gap-2 flex-wrap pt-2">
                  <input value={lessonName} onChange={e => setLessonName(e.target.value)}
                    placeholder="Nombre de la lección"
                    className="flex-1 min-w-40 font-body text-lg border-2 border-purple-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500" />
                  <input value={lessonLetters} onChange={e => setLessonLetters(e.target.value)}
                    placeholder="Letras nuevas (ej: b, v)"
                    className="flex-1 min-w-40 font-body text-lg border-2 border-purple-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500" />
                  <motion.button onClick={addLesson} whileTap={{ scale: 0.95 }}
                    className="btn-press bg-purple-500 text-white font-kids text-lg px-5 py-2 rounded-xl shadow-[0_3px_0_#7e22ce]">
                    Agregar
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap gap-2">
            {sortedLessons.map((l, i) => (
              <div key={l.id} className={`flex items-center gap-1 pl-3 pr-1 py-1 rounded-full text-sm font-bold ${LESSON_COLORS[i % LESSON_COLORS.length]}`}>
                <span>{l.name}</span>
                <span className="opacity-60 text-xs">+{(l.new_letters ?? []).join(',')}</span>
                <button onClick={() => deleteLesson(l.id)} className="ml-1 opacity-50 hover:opacity-100 font-bold">×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Add word */}
        <div className="bg-white rounded-2xl p-5 shadow-md mb-5">
          <p className="font-kids text-2xl text-purple-700 mb-3">Agregar ✏️</p>
          <div className="flex gap-3 flex-wrap">
            <input value={newText} onChange={e => setNewText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addWord()}
              placeholder="Escribe una sílaba, palabra o frase..."
              className="flex-1 min-w-48 font-body text-xl border-2 border-purple-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
            <select value={newType} onChange={e => setNewType(e.target.value)}
              className="font-body font-bold text-lg border-2 border-purple-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500">
              <option value="silaba">Sílaba</option>
              <option value="palabra">Palabra</option>
              <option value="frase">Frase</option>
            </select>
            <select value={newLesson} onChange={e => setNewLesson(e.target.value)}
              className="font-body font-bold text-lg border-2 border-purple-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500">
              {sortedLessons.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <motion.button onClick={addWord} whileTap={{ scale: 0.95 }}
              className="btn-press bg-purple-500 hover:bg-purple-600 text-white font-kids text-xl px-6 py-3 rounded-xl shadow-[0_4px_0_#7e22ce]">
              Agregar +
            </motion.button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-4">
          <select value={filterLesson} onChange={e => setFilterLesson(e.target.value)}
            className="font-body font-bold text-base border-2 border-orange-200 rounded-full px-4 py-2 focus:outline-none focus:border-orange-400 bg-white">
            <option value="todas">Todas las lecciones</option>
            {sortedLessons.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          {['todas','silaba','palabra','frase'].map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`font-body font-bold text-base px-4 py-2 rounded-full border-2 transition-colors ${
                filterType === t ? 'bg-orange-400 text-white border-orange-600' : 'bg-white text-orange-600 border-orange-200'
              }`}>
              {t === 'todas' ? 'Todos' : TYPE_LABELS[t]}
            </button>
          ))}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
            className="font-body text-base border-2 border-orange-200 rounded-full px-4 py-2 focus:outline-none focus:border-orange-400 flex-1 min-w-28 bg-white" />
        </div>

        {/* Word list */}
        <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-1">
          <AnimatePresence>
            {filtered.map(w => (
              <WordCard
                key={w.id} word={w}
                lessonName={lessonMap[w.lesson_id]?.name ?? w.lesson_id ?? '—'}
                colorClass={lessonColor(sortedLessons, w.lesson_id)}
                onToggle={toggleWord} onDelete={deleteWord}
              />
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <p className="text-center font-body text-gray-400 text-xl py-8">No hay palabras 😅</p>
          )}
        </div>

      </div>
    </div>
  )
}
