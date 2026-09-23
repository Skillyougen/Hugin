import { SCENARIOS, SCENARIO_ORDER } from '../../mocks/scenarios'
import { useScenario } from '../../context/ScenarioContext'

/**
 * Sélecteur de scénario — outil de démo (cahier des charges §8 : le
 * scénario passe de normal → stress → crise pendant la présentation).
 *
 * Ce n'est PAS une fonctionnalité produit : une fois le vrai simulateur de
 * montre et le backend branchés, ce composant disparaît et les pages
 * consomment directement l'API.
 */
export default function ScenarioSwitcher() {
  const { scenarioKey, setScenarioKey } = useScenario()

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-full border border-dashed border-surface-border bg-surface-sunken/60 px-3 py-2 text-xs">
      <span className="font-medium text-text-muted">Scénario démo&nbsp;:</span>
      <div className="flex gap-1">
        {SCENARIO_ORDER.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setScenarioKey(key)}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              scenarioKey === key
                ? 'gradient-brand text-white'
                : 'bg-surface-card text-text-secondary hover:bg-surface-sunken'
            }`}
          >
            {SCENARIOS[key].label}
          </button>
        ))}
      </div>
    </div>
  )
}
