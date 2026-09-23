import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/nav/AppLayout'
import Chat from './pages/Chat'
import VitalData from './pages/VitalData'
import History from './pages/History'
import { ScenarioProvider } from './context/ScenarioContext'

export default function App() {
  return (
    <ScenarioProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Chat />} />
          <Route path="/donnees" element={<VitalData />} />
          <Route path="/historique" element={<History />} />
        </Route>
      </Routes>
    </ScenarioProvider>
  )
}
