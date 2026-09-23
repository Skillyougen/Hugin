import { useMemo } from 'react'
import ScenarioSwitcher from '../components/dev/ScenarioSwitcher'
import WellbeingCard from '../components/status/WellbeingCard'
import RecommendationCard from '../components/status/RecommendationCard'
import VitalMiniCard from '../components/vitals/VitalMiniCard'
import VitalsChart from '../components/vitals/VitalsChart'
import ThresholdLegend from '../components/vitals/ThresholdLegend'
import { useScenario } from '../context/ScenarioContext'
import { computeWellbeing } from '../utils/wellbeing'
import { generateRecommendations } from '../mocks/recommendations'
import { formatTime } from '../utils/format'

export default function VitalDataPage() {
  const { scenario, scenarioKey } = useScenario()
  const wellbeing = useMemo(() => computeWellbeing(scenario.vitals), [scenario])
  const recommendations = useMemo(() => generateRecommendations(scenarioKey, scenario.vitals), [scenarioKey, scenario])

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-2xl flex-col gap-5 p-4">
        <ScenarioSwitcher />
        <WellbeingCard wellbeing={wellbeing} />

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="m-0 text-sm font-semibold text-text-primary">Valeurs en temps réel</h2>
            <span className="text-xs text-text-muted">Mise à jour {formatTime(new Date())}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.keys(scenario.vitals).map((vitalKey) => (
              <VitalMiniCard key={vitalKey} vitalKey={vitalKey} value={scenario.vitals[vitalKey]} />
            ))}
          </div>
          <ThresholdLegend />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="m-0 text-sm font-semibold text-text-primary">Évolution</h2>
          <VitalsChart />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="m-0 text-sm font-semibold text-text-primary">Recommandations</h2>
          {recommendations.map((r) => (
            <RecommendationCard key={r.id} recommendation={r} />
          ))}
        </section>
      </div>
    </div>
  )
}
