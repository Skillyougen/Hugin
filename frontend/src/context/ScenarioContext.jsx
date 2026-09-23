import { createContext, useContext, useMemo, useState } from 'react'
import { SCENARIOS } from '../mocks/scenarios'

const ScenarioContext = createContext(null)

/**
 * Scénario courant (normal / stress / crise). Le backend est branché sur les
 * pages Données/Historique (voir pages/VitalData.jsx, pages/History.jsx) ;
 * ce contexte ne pilote plus que la démo Foxy de la page Chat, qui reste
 * mockée (pas d'endpoint de chat libre côté backend, voir
 * docs/contrat-interface.md).
 */
export function ScenarioProvider({ children }) {
  const [scenarioKey, setScenarioKey] = useState('normal')
  const value = useMemo(
    () => ({ scenarioKey, setScenarioKey, scenario: SCENARIOS[scenarioKey] }),
    [scenarioKey],
  )
  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>
}

export function useScenario() {
  const ctx = useContext(ScenarioContext)
  if (!ctx) throw new Error('useScenario doit être utilisé dans un <ScenarioProvider>')
  return ctx
}
