import { createContext, useContext, useReducer, useCallback } from 'react'
import { DEFAULT_WORDS, LETTER_GROUPS } from '../data/words'

const GameContext = createContext(null)

const STORAGE_KEY = 'aprende-leer-words'
const SETTINGS_KEY = 'aprende-leer-settings'

function loadWords() {
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
    contentType: 'todas', // 'todas' | 'silaba' | 'palabra' | 'frase'
    timeLimit: 0, // 0 = sin límite, 10, 30, 60
    level: 0, // 0 = todos
  }
}

const initialState = {
  screen: 'home', // 'home' | 'game' | 'dashboard' | 'settings' | 'results'
  words: loadWords(),
  settings: loadSettings(),
  session: {
    correct: 0,
    wrong: 0,
    total: 0,
    history: [],
  },
  currentWord: null,
  queue: [],
  feedback: null, // 'correct' | 'wrong' | null
  timeLeft: 0,
  timerActive: false,
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function filterWords(words, settings) {
  let filtered = words.filter(w => w.active !== false)

  if (settings.contentType !== 'todas') {
    filtered = filtered.filter(w => w.type === settings.contentType)
  }

  if (settings.level > 0) {
    filtered = filtered.filter(w => w.level === settings.level)
  }

  if (settings.letterFilter !== 'todas') {
    const allowed = LETTER_GROUPS[settings.letterFilter]
    if (allowed) {
      filtered = filtered.filter(w =>
        w.text.toLowerCase().split('').every(c => !c.match(/[a-záéíóúñü]/) || allowed.includes(c))
      )
    }
  }

  return filtered.length > 0 ? filtered : words.filter(w => w.active !== false)
}

function buildQueue(words, settings) {
  let filtered = words.filter(w => w.active !== false)
  if (settings.contentType !== 'todas') {
    filtered = filtered.filter(w => w.type === settings.contentType)
  }
  if (settings.level > 0) {
    filtered = filtered.filter(w => w.level === settings.level)
  }
  return shuffle(filtered.length > 0 ? filtered : words.filter(w => w.active !== false))
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen }

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
      const history = [...state.session.history, {
        word: state.currentWord,
        correct,
      }]
      const session = {
        correct: state.session.correct + (correct ? 1 : 0),
        wrong: state.session.wrong + (correct ? 0 : 1),
        total: state.session.total + 1,
        history,
      }
      return { ...state, session, feedback: correct ? 'correct' : 'wrong', timerActive: false }
    }

    case 'NEXT_WORD': {
      let queue = state.queue
      if (queue.length === 0) {
        queue = buildQueue(state.words, state.settings)
      }
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
        const history = [...state.session.history, {
          word: state.currentWord,
          correct: false,
          timeout: true,
        }]
        return {
          ...state,
          timeLeft: 0,
          timerActive: false,
          feedback: 'wrong',
          session: {
            ...state.session,
            wrong: state.session.wrong + 1,
            total: state.session.total + 1,
            history,
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

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const startGame = useCallback(() => dispatch({ type: 'START_GAME' }), [])
  const answer = useCallback((correct) => dispatch({ type: 'ANSWER', correct }), [])
  const nextWord = useCallback(() => dispatch({ type: 'NEXT_WORD' }), [])
  const tick = useCallback(() => dispatch({ type: 'TICK' }), [])
  const setScreen = useCallback((screen) => dispatch({ type: 'SET_SCREEN', screen }), [])
  const updateSettings = useCallback((settings) => dispatch({ type: 'UPDATE_SETTINGS', settings }), [])
  const updateWords = useCallback((words) => dispatch({ type: 'UPDATE_WORDS', words }), [])
  const resetWords = useCallback(() => dispatch({ type: 'RESET_WORDS' }), [])
  const endGame = useCallback(() => dispatch({ type: 'END_GAME' }), [])

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
