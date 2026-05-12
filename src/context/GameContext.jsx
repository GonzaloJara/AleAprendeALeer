import { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { DEFAULT_WORDS, DEFAULT_LESSONS, getLessonsUpTo } from '../data/lessons'
import { supabase } from '../utils/supabase'

const GameContext = createContext(null)

const WORDS_KEY    = 'aprende-leer-words'
const LESSONS_KEY  = 'aprende-leer-lessons'
const SETTINGS_KEY = 'aprende-leer-settings'

function fromCache(key, fallback) {
  try {
    const s = localStorage.getItem(key)
    return s ? JSON.parse(s) : fallback
  } catch { return fallback }
}

function defaultSettings() {
  return {
    contentType: 'todas',   // todas | silaba | palabra | frase
    timeLimit: 0,           // 0 | 10 | 30 | 60
    lessonId: null,         // null = all lessons; string = cumulative up to that lesson
    animationsEnabled: true,
  }
}

// ── Supabase ──────────────────────────────────────────────────────────────────

async function fetchTable(table) {
  const { data, error } = await supabase.from(table).select('*')
  if (error) { console.error(`[supabase] ${table} fetch`, error); return null }
  return data
}

async function syncTable(table, rows, conflictCol = 'id') {
  if (rows.length > 0) {
    const { error } = await supabase.from(table).upsert(rows, { onConflict: conflictCol })
    if (error) { console.error(`[supabase] ${table} upsert`, error); return }
  }
  // Delete rows removed locally
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
  words:   fromCache(WORDS_KEY,   DEFAULT_WORDS),
  lessons: fromCache(LESSONS_KEY, DEFAULT_LESSONS),
  settings: fromCache(SETTINGS_KEY, null) ?? defaultSettings(),
  session: { correct: 0, wrong: 0, total: 0, history: [] },
  currentWord: null,
  queue: [],
  feedback: null,
  timeLeft: 0,
  timerActive: false,
  loading: true,
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

  if (settings.lessonId) {
    const included = new Set(getLessonsUpTo(lessons, settings.lessonId).map(l => l.id))
    pool = pool.filter(w => included.has(w.lesson_id))
  }

  if (settings.contentType !== 'todas') {
    pool = pool.filter(w => w.type === settings.contentType)
  }

  return shuffle(pool.length > 0 ? pool : words.filter(w => w.active !== false))
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
      }
    }

    case 'ANSWER': {
      const { correct } = action
      return {
        ...state,
        feedback: correct ? 'correct' : 'wrong',
        timerActive: false,
        session: {
          correct:  state.session.correct  + (correct ? 1 : 0),
          wrong:    state.session.wrong    + (correct ? 0 : 1),
          total:    state.session.total    + 1,
          history:  [...state.session.history, { word: state.currentWord, correct }],
        },
      }
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

    case 'RESET': {
      localStorage.setItem(WORDS_KEY,   JSON.stringify(DEFAULT_WORDS))
      localStorage.setItem(LESSONS_KEY, JSON.stringify(DEFAULT_LESSONS))
      return { ...state, words: DEFAULT_WORDS, lessons: DEFAULT_LESSONS }
    }

    case 'END_GAME':
      return { ...state, screen: 'results', timerActive: false }

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
      if (dbLessons.length === 0 && dbWords.length === 0) {
        // Seed: lessons before words to respect any FK-like ordering
        await syncTable('lessons', DEFAULT_LESSONS)
        await syncTable('words',   DEFAULT_WORDS)
        dispatch({ type: 'HYDRATE', words: DEFAULT_WORDS, lessons: DEFAULT_LESSONS })
      } else {
        dispatch({
          type: 'HYDRATE',
          words:   dbWords.length   > 0 ? dbWords   : DEFAULT_WORDS,
          lessons: dbLessons.length > 0 ? dbLessons : DEFAULT_LESSONS,
        })
      }
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

  const updateWords = useCallback((words) => {
    dispatch({ type: 'UPDATE_WORDS', words })
    syncTable('words', words)
  }, [])

  const updateLessons = useCallback((lessons) => {
    dispatch({ type: 'UPDATE_LESSONS', lessons })
    syncTable('lessons', lessons)
  }, [])

  const resetAll = useCallback(async () => {
    dispatch({ type: 'RESET' })
    // Delete all words before touching lessons (avoids any ordering issues)
    const { data: wordIds } = await supabase.from('words').select('id')
    if (wordIds?.length) {
      await supabase.from('words').delete().in('id', wordIds.map(r => r.id))
    }
    await syncTable('lessons', DEFAULT_LESSONS)
    await supabase.from('words').insert(DEFAULT_WORDS)
  }, [])

  return (
    <GameContext.Provider value={{
      state, startGame, answer, nextWord, tick, setScreen,
      updateSettings, updateWords, updateLessons, resetAll, endGame,
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
