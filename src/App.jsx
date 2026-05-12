import { AnimatePresence, motion } from 'framer-motion'
import { GameProvider, useGame } from './context/GameContext'
import HomeScreen from './components/HomeScreen'
import GameScreen from './components/GameScreen'
import SettingsScreen from './components/SettingsScreen'
import DashboardScreen from './components/DashboardScreen'
import ResultsScreen from './components/ResultsScreen'
import LessonSelectScreen from './components/LessonSelectScreen'

const screenVariants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.04 },
}

function AppContent() {
  const { state } = useGame()
  const { screen } = state

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen}
        variants={screenVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.25 }}
        className="min-h-screen"
      >
        {screen === 'home' && <HomeScreen />}
        {screen === 'game' && <GameScreen />}
        {screen === 'settings' && <SettingsScreen />}
        {screen === 'dashboard' && <DashboardScreen />}
        {screen === 'results' && <ResultsScreen />}
        {screen === 'lesson-select' && <LessonSelectScreen />}
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  )
}
