import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ScenarioProvider } from './context/ScenarioContext'
import TopNav from './components/nav/TopNav'
import IntroSplash from './components/mascot/IntroSplash'
import ChatPage from './pages/Chat'
import VitalDataPage from './pages/VitalData'
import HistoryPage from './pages/History'
import { useNightShift } from './utils/nightShift'

const INTRO_KEY = 'huginn-intro-vue'

export default function App() {
  const night = useNightShift()
  // L'intro Foxy se joue une fois par session, par-dessus l'app déjà montée.
  const [intro, setIntro] = useState(() => !sessionStorage.getItem(INTRO_KEY))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', night)
  }, [night])

  function endIntro() {
    sessionStorage.setItem(INTRO_KEY, '1')
    setIntro(false)
  }

  return (
    <ScenarioProvider>
      <BrowserRouter>
        <div className="flex h-dvh flex-col bg-surface text-text-primary">
          <TopNav />
          <main className="min-h-0 flex-1">
            <Routes>
              <Route path="/" element={<ChatPage />} />
              <Route path="/donnees" element={<VitalDataPage />} />
              <Route path="/historique" element={<HistoryPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
        {intro && <IntroSplash onDone={endIntro} />}
      </BrowserRouter>
    </ScenarioProvider>
  )
}
