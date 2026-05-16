import { AnimatePresence, motion } from 'framer-motion'
import { GameProvider, useGame } from './context/GameContext'
import HomeScreen from './components/HomeScreen'
import GameScreen from './components/GameScreen'
import SettingsScreen from './components/SettingsScreen'
import DashboardScreen from './components/DashboardScreen'
import ResultsScreen from './components/ResultsScreen'
import LessonSelectScreen from './components/LessonSelectScreen'
import UserSelectScreen from './components/UserSelectScreen'
import LevelCompleteScreen from './components/LevelCompleteScreen'

const screenVariants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit:    { opacity: 0, scale: 1.04 },
}

function AppContent() {
  const { state } = useGame()
  const { screen, progress } = state

  // If no user is set yet, always show the user-select screen first
  const activeScreen = (!progress?.currentUser && screen !== 'user-select')
    ? 'user-select'
    : screen

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeScreen}
        variants={screenVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.25 }}
        className="min-h-screen"
      >
        {activeScreen === 'user-select'    && <UserSelectScreen />}
        {activeScreen === 'home'           && <HomeScreen />}
        {activeScreen === 'lesson-select'  && <LessonSelectScreen />}
        {activeScreen === 'game'           && <GameScreen />}
        {activeScreen === 'lesson-complete'&& <LevelCompleteScreen />}
        {activeScreen === 'results'        && <ResultsScreen />}
        {activeScreen === 'settings'       && <SettingsScreen />}
        {activeScreen === 'dashboard'      && <DashboardScreen />}
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
