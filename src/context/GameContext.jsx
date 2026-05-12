import { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { DEFAULT_WORDS, LETTER_GROUPS } from '../data/words'
import { supabase } from '../utils/supabase'

const GameContext = createContext(null)

const STORAGE_KEY = 'aprende-leer-words'
const SETTINGS_KEY = 'aprende-leer-settings'

function loadWordsFromCache() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : DEFAULT_WORDS
  } catch {
    return DEFAULT_WORDS
  }
}

function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY)
    return saved ? JSON.parse(saved) : defaultSettings()
  } catch {
    return defaultSettings()
  }
}

function defaultSettings() {
  return {
    letterFilter: 'todas',
    contentType: 'todas',
    timeLimit: 0,
    level: 0,
    animationsEnabled: true,
  }
}

// ── Supabase helpers ──────────────────────────────────────────────────────────

async function fetchWords() {
  const { data, error } = await supabase.from('words').select('*')
  if (error) { console.error('[supabase] fetch error', error); return null }
  return data
}

async function syncWords(words) {
  if (words.length > 0) {
    const { error } = await supabase
      .from('words')
      .upsert(words.map(w => ({ ...w, active: w.active !== false })), { onConflict: 'id' })
    if (error) { console.error('[supabase] upsert error', error); return }
  }
  // Delete rows from DB that are no longer in the local list
  const { data: dbRows } = await supabase.from('words').select('id')
  if (dbRows) {
    const currentIds = new Set(words.map(w => w.id))
    const toDelete = dbRows.map(r => r.id).filter(id => !currentIds.has(id))
    if (toDelete.length > 0) {
      await supabase.from('words').delete().in('id', toDelete)
    }
  }
}

// ── Reducer ───────────────────────────────────────────────────────────────────

const initialState = {
  screen: 'home',
  words: loadWordsFromCache(),
  settings: loadSettings(),
  session: { correct: 0, wrong: 0, total: 0, history: [] },
  currentWord: null,
  queue: [],
  feedback: null,
  timeLeft: 0,
  timerActive: false,
  wordsLoading: true,
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQueue(words, settings) {
  let filtered = words.filter(w => w.active !== false)
  if (settings.contentType !== 'todas') filtered = filtered.filter(w => w.type === settings.contentType)
  if (settings.level > 0) filtered = filtered.filter(w => w.level === settings.level)
  return shuffle(filtered.length > 0 ? filtered : words.filter(w => w.active !== false))
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen }

    case 'HYDRATE_WORDS': {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(action.words))
      return { ...state, words: action.words, wordsLoading: false }
    }

    case 'SET_WORDS_LOADED':
      return { ...state, wordsLoading: false }

    case 'START_GAME': {
      const queue = buildQueue(state.words, state.settings)
      const currentWord = queue[0] || null
      return {
        ...state,
        screen: 'game',
        session: { correct: 0, wrong: 0, total: 0, history: [] },
        queue: queue.slice(1),
        currentWord,
        feedback: null,
        timeLeft: state.settings.timeLimit || 0,
        timerActive: state.settings.timeLimit > 0,
      }
    }

    case 'ANSWER': {
      const { correct } = action
      const history = [...state.session.history, { word: state.currentWord, correct }]
      return {
        ...state,
        feedback: correct ? 'correct' : 'wrong',
        timerActive: false,
        session: {
          correct: state.session.correct + (correct ? 1 : 0),
          wrong: state.session.wrong + (correct ? 0 : 1),
          total: state.session.total + 1,
          history,
        },
      }
    }

    case 'NEXT_WORD': {
      let queue = state.queue
      if (queue.length === 0) queue = buildQueue(state.words, state.settings)
      const currentWord = queue[0] || null
      return {
        ...state,
        currentWord,
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
            wrong: state.session.wrong + 1,
            total: state.session.total + 1,
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(action.words))
      return { ...state, words: action.words }
    }

    case 'RESET_WORDS': {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_WORDS))
      return { ...state, words: DEFAULT_WORDS }
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

  // On mount: load words from Supabase, seed if empty
  useEffect(() => {
    fetchWords().then(data => {
      if (data === null) {
        // Network error — keep cache, mark loaded
        dispatch({ type: 'SET_WORDS_LOADED' })
      } else if (data.length === 0) {
        // Empty table — seed with defaults
        syncWords(DEFAULT_WORDS)
        dispatch({ type: 'HYDRATE_WORDS', words: DEFAULT_WORDS })
      } else {
        dispatch({ type: 'HYDRATE_WORDS', words: data })
      }
    })
  }, [])

  const startGame    = useCallback(() => dispatch({ type: 'START_GAME' }), [])
  const answer       = useCallback((correct) => dispatch({ type: 'ANSWER', correct }), [])
  const nextWord     = useCallback(() => dispatch({ type: 'NEXT_WORD' }), [])
  const tick         = useCallback(() => dispatch({ type: 'TICK' }), [])
  const setScreen    = useCallback((screen) => dispatch({ type: 'SET_SCREEN', screen }), [])
  const updateSettings = useCallback((settings) => dispatch({ type: 'UPDATE_SETTINGS', settings }), [])
  const endGame      = useCallback(() => dispatch({ type: 'END_GAME' }), [])

  const updateWords = useCallback((words) => {
    dispatch({ type: 'UPDATE_WORDS', words })
    syncWords(words)
  }, [])

  const resetWords = useCallback(() => {
    dispatch({ type: 'RESET_WORDS' })
    syncWords(DEFAULT_WORDS)
  }, [])

  return (
    <GameContext.Provider value={{ state, startGame, answer, nextWord, tick, setScreen, updateSettings, updateWords, resetWords, endGame }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
