import { createContext, useContext, useMemo, useState } from 'react'
import { SCENARIOS } from '../mocks/scenarios'

const ScenarioContext = createContext(null)

/**
 * Scénario courant (normal / stress / crise). Sert uniquement à piloter la
 * démo tant que le flux "simulateur de montre → backend → app" n'est pas
 * branché. Le sélecteur associé (components/dev/ScenarioSwitcher) est un
 * outil de démo, pas une fonctionnalité du cahier des charges.
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
