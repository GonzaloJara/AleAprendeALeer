import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { getLessonsUpTo } from '../data/lessons'

const LESSON_COLORS = [
  { bg: 'bg-red-100',    border: 'border-red-300',    text: 'text-red-700',    shadow: '#fca5a5' },
  { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700', shadow: '#fdba74' },
  { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-700', shadow: '#fde047' },
  { bg: 'bg-green-100',  border: 'border-green-300',  text: 'text-green-700',  shadow: '#86efac' },
  { bg: 'bg-teal-100',   border: 'border-teal-300',   text: 'text-teal-700',   shadow: '#5eead4' },
  { bg: 'bg-blue-100',   border: 'border-blue-300',   text: 'text-blue-700',   shadow: '#93c5fd' },
  { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-700', shadow: '#a5b4fc' },
  { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-700', shadow: '#d8b4fe' },
  { bg: 'bg-pink-100',   border: 'border-pink-300',   text: 'text-pink-700',   shadow: '#f9a8d4' },
  { bg: 'bg-rose-100',   border: 'border-rose-300',   text: 'text-rose-700',   shadow: '#fda4af' },
]

export default function LessonSelectScreen() {
  const { state, updateSettings, startGame, setScreen } = useGame()
  const { lessons, progress } = state

  const sortedLessons = [...lessons].sort((a, b) => a.sort_order - b.sort_order)

  // Build cumulative letter list per lesson
  const cumulativeLetters = {}
  const accum = []
  for (const l of sortedLessons) {
    accum.push(...(l.new_letters ?? []))
    cumulativeLetters[l.id] = [...accum]
  }

  const completedLessons = new Set(
    progress?.users?.[progress?.currentUser]?.completedLessons ?? []
  )

  const pick = (lessonId) => {
    updateSettings({ lessonId })
    startGame()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-purple-200 to-yellow-100 p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center gap-4 mb-6">
          <motion.button
            onClick={() => setScreen('home')}
            className="btn-press bg-gray-200 hover:bg-gray-300 text-gray-700 font-kids text-2xl px-5 py-3 rounded-2xl shadow-[0_4px_0_#9ca3af]"
            whileTap={{ scale: 0.95 }}
          >
            ← Volver
          </motion.button>
          <h1 className="font-kids text-4xl text-purple-700">¿Qué lección? 📚</h1>
        </div>

        <div className="flex flex-col gap-4">
          {/* All lessons option */}
          <motion.button
            onClick={() => pick(null)}
            whileTap={{ scale: 0.97 }}
            className="btn-press bg-white border-4 border-purple-300 rounded-3xl px-6 py-5 shadow-[0_5px_0_#d8b4fe] text-left w-full"
          >
            <span className="font-kids text-3xl text-purple-600">Todas las lecciones 🌈</span>
            <p className="font-body text-purple-400 text-sm mt-1">Mezcla palabras de todas las lecciones</p>
          </motion.button>

          {sortedLessons.map((l, i) => {
            const c    = LESSON_COLORS[i % LESSON_COLORS.length]
            const letters = cumulativeLetters[l.id] ?? []
            const done = completedLessons.has(l.id)
            return (
              <motion.button
                key={l.id}
                onClick={() => pick(l.id)}
                whileTap={{ scale: 0.97 }}
                className={`btn-press ${c.bg} border-4 ${c.border} rounded-3xl px-6 py-5 text-left w-full`}
                style={{ boxShadow: `0 5px 0 ${c.shadow}` }}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-kids text-3xl ${c.text} flex-1`}>{l.name}</span>
                  {done && (
                    <span className="text-3xl" title="¡Lección completada!">⭐</span>
                  )}
                </div>
                <p className={`font-body text-sm mt-1 ${c.text} opacity-70`}>
                  letras: {letters.join(', ')}
                </p>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
