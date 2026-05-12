import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'

const TIME_OPTIONS = [
  { value: 0,  label: 'Sin límite ♾️' },
  { value: 10, label: '10 segundos ⚡' },
  { value: 30, label: '30 segundos 🕐' },
  { value: 60, label: '1 minuto 🕑' },
]

const TYPE_OPTIONS = [
  { value: 'todas',   label: 'Todo 🎲' },
  { value: 'silaba',  label: 'Solo sílabas 🔤' },
  { value: 'palabra', label: 'Solo palabras 📝' },
  { value: 'frase',   label: 'Solo frases 💬' },
]

const BOOST_OPTIONS = [
  { value: 50,  label: 'Igual 50/50' },
  { value: 70,  label: 'Nueva 70%' },
  { value: 80,  label: 'Nueva 80% ✨' },
  { value: 90,  label: 'Nueva 90%' },
  { value: 100, label: 'Solo nueva' },
]

function OptionRow({ label, children }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-md">
      <p className="font-kids text-2xl text-purple-700 mb-3">{label}</p>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  )
}

function Chip({ selected, onClick, children }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      className={`font-body font-bold text-lg px-5 py-2 rounded-full border-2 transition-colors text-left ${
        selected
          ? 'bg-purple-500 text-white border-purple-700 shadow-md'
          : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
      }`}
    >
      {children}
    </motion.button>
  )
}

function LessonChip({ lesson, selected, onClick, allLetters }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      className={`font-body font-bold text-lg px-4 py-2 rounded-2xl border-2 transition-colors text-left flex flex-col gap-0.5 ${
        selected
          ? 'bg-purple-500 text-white border-purple-700 shadow-md'
          : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
      }`}
    >
      <span>{lesson.name}</span>
      <span className={`text-sm font-normal tracking-wide ${selected ? 'text-purple-100' : 'text-purple-400'}`}>
        letras: {allLetters.join(', ')}
      </span>
    </motion.button>
  )
}

export default function SettingsScreen() {
  const { state, updateSettings, setScreen } = useGame()
  const { settings, lessons } = state

  // Build cumulative letter list for each lesson
  const sortedLessons = [...lessons].sort((a, b) => a.sort_order - b.sort_order)
  const cumulativeLetters = {}
  const accum = []
  for (const l of sortedLessons) {
    accum.push(...(l.new_letters ?? []))
    cumulativeLetters[l.id] = [...accum]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-purple-100 p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <motion.button
            onClick={() => setScreen('home')}
            className="btn-press bg-gray-200 hover:bg-gray-300 text-gray-700 font-kids text-2xl px-6 py-3 rounded-2xl shadow-[0_4px_0_#9ca3af]"
            whileTap={{ scale: 0.95 }}
          >
            ← Volver
          </motion.button>
          <h1 className="font-kids text-5xl text-purple-700 text-shadow-kids">Reglas ⚙️</h1>
        </div>

        <div className="flex flex-col gap-5">
          {/* Lesson selector */}
          <div className="bg-white rounded-2xl p-5 shadow-md">
            <p className="font-kids text-2xl text-purple-700 mb-1">Lección 📚</p>
            <p className="font-body text-sm text-purple-400 mb-4">
              Cada lección incluye todas las lecciones anteriores
            </p>
            <div className="flex flex-wrap gap-3">
              <Chip
                selected={!settings.lessonId}
                onClick={() => updateSettings({ lessonId: null })}
              >
                Todas las lecciones 🌈
              </Chip>
              {sortedLessons.map(l => (
                <LessonChip
                  key={l.id}
                  lesson={l}
                  selected={settings.lessonId === l.id}
                  onClick={() => updateSettings({ lessonId: l.id })}
                  allLetters={cumulativeLetters[l.id] ?? []}
                />
              ))}
            </div>
          </div>

          <OptionRow label="Tipo de contenido 📖">
            {TYPE_OPTIONS.map(o => (
              <Chip key={o.value} selected={settings.contentType === o.value} onClick={() => updateSettings({ contentType: o.value })}>
                {o.label}
              </Chip>
            ))}
          </OptionRow>

          <div className="bg-white rounded-2xl p-5 shadow-md">
            <p className="font-kids text-2xl text-purple-700 mb-1">Prioridad lección nueva 🎯</p>
            <p className="font-body text-sm text-purple-400 mb-4">
              Cuánto más seguido aparecen las palabras de la lección elegida vs las anteriores
            </p>
            <div className="flex flex-wrap gap-3">
              {BOOST_OPTIONS.map(o => (
                <Chip key={o.value} selected={(settings.lessonBoost ?? 80) === o.value} onClick={() => updateSettings({ lessonBoost: o.value })}>
                  {o.label}
                </Chip>
              ))}
            </div>
          </div>

          <OptionRow label="Tiempo por palabra ⏱️">
            {TIME_OPTIONS.map(o => (
              <Chip key={o.value} selected={settings.timeLimit === o.value} onClick={() => updateSettings({ timeLimit: o.value })}>
                {o.label}
              </Chip>
            ))}
          </OptionRow>

          <OptionRow label="Animaciones 🎬">
            <Chip selected={settings.animationsEnabled !== false} onClick={() => updateSettings({ animationsEnabled: true })}>
              Activadas ✨
            </Chip>
            <Chip selected={settings.animationsEnabled === false} onClick={() => updateSettings({ animationsEnabled: false })}>
              Desactivadas 📺
            </Chip>
          </OptionRow>
        </div>

        <motion.button
          onClick={() => setScreen('home')}
          className="btn-press mt-8 w-full bg-green-400 hover:bg-green-500 text-white font-kids text-3xl py-5 rounded-3xl shadow-[0_6px_0_#16a34a]"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          ¡Listo! ✅
        </motion.button>
      </div>
    </div>
  )
}
