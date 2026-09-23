import { SCENARIOS, SCENARIO_ORDER } from '../../mocks/scenarios'
import { useScenario } from '../../context/ScenarioContext'

/**
 * Sélecteur de scénario — outil de démo (le scénario passe de normal →
 * stress → crise pendant la présentation). Pas une fonctionnalité produit.
 */
export default function ScenarioSwitcher() {
  const { scenarioKey, setScenarioKey } = useScenario()

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-full border border-dashed border-surface-border bg-surface-sunken px-3 py-2">
      <span className="text-xs font-medium text-text-muted">Scénario démo :</span>
      <div className="flex gap-1" role="radiogroup" aria-label="Scénario démo">
        {SCENARIO_ORDER.map((key) => {
          const active = scenarioKey === key
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setScenarioKey(key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                active ? 'bg-linear-to-br from-ocean-500 to-mint-500 text-white' : 'bg-surface-card text-text-secondary hover:text-text-primary'
              }`}
            >
              {SCENARIOS[key].label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
