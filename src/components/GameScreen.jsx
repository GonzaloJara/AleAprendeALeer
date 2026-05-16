import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../context/GameContext'
import SuccessAnimation from './SuccessAnimation'

function wordFontSize(word) {
  if (word.type === 'frase') return 'clamp(1.6rem, 4vw, 3rem)'
  const len = word.text.length
  if (len <= 3)  return 'clamp(5rem, 18vw, 9rem)'
  if (len <= 5)  return 'clamp(4rem, 14vw, 7.5rem)'
  if (len <= 7)  return 'clamp(3rem, 10vw, 6rem)'
  if (len <= 10) return 'clamp(2.2rem, 7vw, 4.5rem)'
  return             'clamp(1.8rem, 5.5vw, 3.5rem)'
}

function noAnim(enabled) {
  return enabled ? {} : { initial: false, animate: {}, exit: {}, transition: { duration: 0 } }
}

function TimerBar({ timeLeft, total, animated }) {
  const pct = total > 0 ? (timeLeft / total) * 100 : 100
  const danger = timeLeft <= 5 && total > 0
  const color = pct > 50 ? '#4ade80' : pct > 25 ? '#facc15' : '#f87171'

  return (
    <div className="w-full bg-white/50 rounded-full h-5 overflow-hidden shadow-inner">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color, width: animated ? undefined : `${pct}%` }}
        animate={animated ? { width: `${pct}%` } : {}}
        transition={{ duration: animated ? 0.5 : 0 }}
      />
      {danger && (
        <p className="text-center font-kids text-red-600 text-2xl mt-1 timer-danger">
          {timeLeft}s ⏰
        </p>
      )}
    </div>
  )
}

function ScoreBadge({ correct, wrong }) {
  return (
    <div className="flex gap-4 justify-center">
      <div className="bg-green-100 border-2 border-green-400 rounded-2xl px-5 py-2 flex items-center gap-2">
        <span className="text-3xl">✅</span>
        <span className="font-kids text-3xl text-green-600">{correct}</span>
      </div>
      <div className="bg-red-100 border-2 border-red-400 rounded-2xl px-5 py-2 flex items-center gap-2">
        <span className="text-3xl">❌</span>
        <span className="font-kids text-3xl text-red-500">{wrong}</span>
      </div>
    </div>
  )
}

export default function GameScreen() {
  const { state, answer, nextWord, tick, endGame, setScreen } = useGame()
  const { currentWord, session, feedback, settings, timeLeft, timerActive, lessonCompleted } = state
  const anim = settings.animationsEnabled !== false
  const target = settings.completionTarget ?? 15

  useEffect(() => {
    if (!timerActive) return
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [timerActive, tick])

  const handleNext = useCallback(() => {
    if (lessonCompleted) setScreen('lesson-complete')
    else nextWord()
  }, [lessonCompleted, nextWord, setScreen])

  if (!currentWord) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-200 to-yellow-100">
      <p className="font-kids text-3xl text-purple-600">No hay palabras disponibles 😅</p>
    </div>
  )

  const typeLabel = { silaba: 'sílaba', palabra: 'palabra', frase: 'frase' }[currentWord.type] || ''

  // Card animation props
  const cardAnim = anim
    ? { initial: { opacity: 0, y: 60, scale: 0.8 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -60, scale: 0.8 }, transition: { type: 'spring', stiffness: 300, damping: 25 } }
    : { initial: false, animate: { opacity: 1, y: 0, scale: 1 }, exit: {}, transition: { duration: 0 } }

  const textPulse = anim
    ? { animate: { scale: [1, 1.02, 1] }, transition: { duration: 2, repeat: Infinity } }
    : {}

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-200 via-purple-100 to-yellow-100">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <motion.button
          onClick={endGame}
          className="btn-press bg-gray-200 text-gray-600 font-kids text-xl px-5 py-2 rounded-2xl shadow-[0_3px_0_#9ca3af]"
          whileTap={anim ? { scale: 0.93 } : {}}
        >
          ← Salir
        </motion.button>
        <ScoreBadge correct={session.correct} wrong={session.wrong} />
      </div>

      {/* Timer */}
      {settings.timeLimit > 0 && (
        <div className="px-6 mt-1">
          <TimerBar timeLeft={timeLeft} total={settings.timeLimit} animated={anim} />
        </div>
      )}

      {/* Lesson completion progress */}
      {settings.lessonId && (
        <div className="px-6 mt-2 flex items-center gap-3">
          <span className="font-body text-sm font-bold text-purple-500 shrink-0">
            🎯 {session.correct}/{target}
          </span>
          <div className="flex-1 bg-white/60 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-purple-400 to-green-400"
              animate={{ width: `${Math.min(100, (session.correct / target) * 100)}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      )}

      {/* Word card */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWord.id}
            className="w-full max-w-2xl bg-white rounded-[2rem] p-8 word-glow text-center overflow-hidden"
            {...cardAnim}
          >
            {typeLabel && (
              <p className="font-body text-xl font-bold text-purple-400 uppercase tracking-widest mb-3">
                {typeLabel}
              </p>
            )}
            <motion.p
              className="font-kids text-center leading-tight break-words"
              style={{ fontSize: wordFontSize(currentWord), color: '#4c1d95', wordBreak: 'break-word', overflowWrap: 'anywhere' }}
              {...textPulse}
            >
              {currentWord.text}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Answer buttons */}
        <div className="flex gap-6 mt-10 w-full max-w-lg">
          <motion.button
            onClick={() => answer(false)}
            disabled={feedback !== null}
            className="btn-press flex-1 bg-red-400 hover:bg-red-500 disabled:opacity-50 text-white font-kids text-4xl py-8 rounded-3xl shadow-[0_8px_0_#b91c1c] flex flex-col items-center gap-1"
            whileHover={anim && !feedback ? { scale: 1.04 } : {}}
            whileTap={anim && !feedback ? { scale: 0.95 } : {}}
          >
            <span className="text-5xl">❌</span>
            <span>Mal</span>
          </motion.button>

          <motion.button
            onClick={() => answer(true)}
            disabled={feedback !== null}
            className="btn-press flex-1 bg-green-400 hover:bg-green-500 disabled:opacity-50 text-white font-kids text-4xl py-8 rounded-3xl shadow-[0_8px_0_#15803d] flex flex-col items-center gap-1"
            whileHover={anim && !feedback ? { scale: 1.04 } : {}}
            whileTap={anim && !feedback ? { scale: 0.95 } : {}}
          >
            <span className="text-5xl">✅</span>
            <span>¡Bien!</span>
          </motion.button>
        </div>
      </div>

      {feedback && (
        <SuccessAnimation type={feedback} onDone={handleNext} animated={anim} />
      )}
    </div>
  )
}
