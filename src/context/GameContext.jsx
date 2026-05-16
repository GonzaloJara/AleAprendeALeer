import { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { getLessonsUpTo } from '../data/lessons'
import { supabase } from '../utils/supabase'

const GameContext = createContext(null)

const WORDS_KEY    = 'aprende-leer-words'
const LESSONS_KEY  = 'aprende-leer-lessons'
const SETTINGS_KEY = 'aprende-leer-settings'
const PROGRESS_KEY = 'aprende-leer-progress'

function fromCache(key, fallback) {
  try {
    const s = localStorage.getItem(key)
    return s ? JSON.parse(s) : fallback
  } catch { return fallback }
}

function defaultSettings() {
  return {
    contentType: 'todas',
    timeLimit: 0,
    lessonId: null,
    lessonBoost: 80,
    completionTarget: 15,
    animationsEnabled: true,
  }
}

function defaultProgress() {
  return { currentUser: null, users: {} }
}

// ── Supabase ──────────────────────────────────────────────────────────────────

async function fetchTable(table) {
  const { data, error } = await supabase.from(table).select('*')
  if (error) { console.error(`[supabase] ${table} fetch`, error); return null }
  return data
}

async function syncTable(table, rows) {
  if (rows.length > 0) {
    const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' })
    if (error) { console.error(`[supabase] ${table} upsert`, error); return }
  }
  const { data: dbRows } = await supabase.from(table).select('id')
  if (dbRows) {
    const live = new Set(rows.map(r => r.id))
    const toDelete = dbRows.map(r => r.id).filter(id => !live.has(id))
    if (toDelete.length > 0) {
      await supabase.from(table).delete().in('id', toDelete)
    }
  }
}

// ── Reducer ───────────────────────────────────────────────────────────────────

const initialState = {
  screen: 'home',
  words:    fromCache(WORDS_KEY,    []),
  lessons:  fromCache(LESSONS_KEY,  []),
  settings: fromCache(SETTINGS_KEY, null) ?? defaultSettings(),
  progress: fromCache(PROGRESS_KEY, null) ?? defaultProgress(),
  session: { correct: 0, wrong: 0, total: 0, history: [] },
  currentWord: null,
  queue: [],
  feedback: null,
  timeLeft: 0,
  timerActive: false,
  loading: true,
  lessonCompleted: false,
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQueue(words, lessons, settings) {
  let pool = words.filter(w => w.active !== false)

  if (settings.contentType !== 'todas') {
    pool = pool.filter(w => w.type === settings.contentType)
  }

  if (!settings.lessonId) {
    return shuffle(pool.length > 0 ? pool : words.filter(w => w.active !== false))
  }

  const included = new Set(getLessonsUpTo(lessons, settings.lessonId).map(l => l.id))
  pool = pool.filter(w => included.has(w.lesson_id))
  if (!pool.length) return shuffle(words.filter(w => w.active !== false))

  const currentWords  = pool.filter(w => w.lesson_id === settings.lessonId)
  const previousWords = pool.filter(w => w.lesson_id !== settings.lessonId)
  const boost = (settings.lessonBoost ?? 80) / 100

  if (!currentWords.length || !previousWords.length || boost <= 0) {
    return shuffle(pool)
  }

  // Weighted queue: each slot picks from current pool with probability=boost,
  // previous pool otherwise. Both sub-pools cycle independently when exhausted.
  const curr = shuffle([...currentWords])
  const prev = shuffle([...previousWords])
  const size = Math.max(20, currentWords.length + previousWords.length)
  let ci = 0, pi = 0
  const result = []
  for (let i = 0; i < size; i++) {
    if (Math.random() < boost) {
      result.push(curr[ci % curr.length])
      ci++
    } else {
      result.push(prev[pi % prev.length])
      pi++
    }
  }
  return result
}

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': {
      const words   = action.words   ?? state.words
      const lessons = action.lessons ?? state.lessons
      localStorage.setItem(WORDS_KEY,   JSON.stringify(words))
      localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons))
      return { ...state, words, lessons, loading: false }
    }
    case 'SET_LOADED':
      return { ...state, loading: false }

    case 'SET_SCREEN':
      return { ...state, screen: action.screen }

    case 'START_GAME': {
      const queue = buildQueue(state.words, state.lessons, state.settings)
      return {
        ...state,
        screen: 'game',
        session: { correct: 0, wrong: 0, total: 0, history: [] },
        queue: queue.slice(1),
        currentWord: queue[0] ?? null,
        feedback: null,
        timeLeft: state.settings.timeLimit || 0,
        timerActive: state.settings.timeLimit > 0,
        lessonCompleted: false,
      }
    }

    case 'ANSWER': {
      const { correct } = action
      const newCorrect = state.session.correct + (correct ? 1 : 0)
      const newSession = {
        correct: newCorrect,
        wrong:   state.session.wrong + (correct ? 0 : 1),
        total:   state.session.total + 1,
        history: [...state.session.history, { word: state.currentWord, correct }],
      }

      // Check lesson completion threshold
      const target = state.settings.completionTarget ?? 15
      if (correct && state.settings.lessonId && newCorrect >= target) {
        const user = state.progress?.currentUser
        let progress = state.progress ?? defaultProgress()
        if (user) {
          const prev = progress.users[user]?.completedLessons ?? []
          const completedLessons = prev.includes(state.settings.lessonId)
            ? prev
            : [...prev, state.settings.lessonId]
          progress = {
            ...progress,
            users: { ...progress.users, [user]: { ...(progress.users[user] ?? {}), completedLessons } },
          }
          localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
        }
        return { ...state, feedback: 'correct', timerActive: false, session: newSession, progress, lessonCompleted: true }
      }

      return { ...state, feedback: correct ? 'correct' : 'wrong', timerActive: false, session: newSession }
    }

    case 'NEXT_WORD': {
      const queue = state.queue.length > 0
        ? state.queue
        : buildQueue(state.words, state.lessons, state.settings)
      return {
        ...state,
        currentWord: queue[0] ?? null,
        queue: queue.slice(1),
        feedback: null,
        timeLeft: state.settings.timeLimit || 0,
        timerActive: state.settings.timeLimit > 0,
      }
    }

    case 'TICK': {
      const timeLeft = state.timeLeft - 1
      if (timeLeft <= 0) {
        return {
          ...state,
          timeLeft: 0,
          timerActive: false,
          feedback: 'wrong',
          session: {
            ...state.session,
            wrong:   state.session.wrong   + 1,
            total:   state.session.total   + 1,
            history: [...state.session.history, { word: state.currentWord, correct: false, timeout: true }],
          },
        }
      }
      return { ...state, timeLeft }
    }

    case 'UPDATE_SETTINGS': {
      const settings = { ...state.settings, ...action.settings }
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
      return { ...state, settings }
    }

    case 'UPDATE_WORDS': {
      localStorage.setItem(WORDS_KEY, JSON.stringify(action.words))
      return { ...state, words: action.words }
    }

    case 'UPDATE_LESSONS': {
      localStorage.setItem(LESSONS_KEY, JSON.stringify(action.lessons))
      return { ...state, lessons: action.lessons }
    }

    case 'END_GAME':
      return { ...state, screen: 'results', timerActive: false }

    case 'SET_USER': {
      const progress = {
        ...state.progress,
        currentUser: action.name,
        users: {
          ...state.progress.users,
          [action.name]: state.progress.users[action.name] ?? { completedLessons: [] },
        },
      }
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
      return { ...state, progress }
    }

    default:
      return state
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    async function init() {
      const [dbLessons, dbWords] = await Promise.all([fetchTable('lessons'), fetchTable('words')])
      if (dbLessons === null || dbWords === null) {
        dispatch({ type: 'SET_LOADED' })
        return
      }
      dispatch({ type: 'HYDRATE', words: dbWords, lessons: dbLessons })
    }
    init()
  }, [])

  const startGame      = useCallback(() => dispatch({ type: 'START_GAME' }), [])
  const answer         = useCallback((correct) => dispatch({ type: 'ANSWER', correct }), [])
  const nextWord       = useCallback(() => dispatch({ type: 'NEXT_WORD' }), [])
  const tick           = useCallback(() => dispatch({ type: 'TICK' }), [])
  const setScreen      = useCallback((screen) => dispatch({ type: 'SET_SCREEN', screen }), [])
  const updateSettings = useCallback((s) => dispatch({ type: 'UPDATE_SETTINGS', settings: s }), [])
  const endGame        = useCallback(() => dispatch({ type: 'END_GAME' }), [])

  const setUser   = useCallback((name) => dispatch({ type: 'SET_USER', name }), [])

  const updateWords = useCallback((words) => {
    dispatch({ type: 'UPDATE_WORDS', words })
    syncTable('words', words)
  }, [])

  const updateLessons = useCallback((lessons) => {
    dispatch({ type: 'UPDATE_LESSONS', lessons })
    syncTable('lessons', lessons)
  }, [])

  return (
    <GameContext.Provider value={{
      state, startGame, answer, nextWord, tick, setScreen,
      updateSettings, updateWords, updateLessons, endGame, setUser,
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
