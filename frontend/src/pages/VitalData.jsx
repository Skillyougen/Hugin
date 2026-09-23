import { useMemo } from 'react'
import ScenarioSwitcher from '../components/dev/ScenarioSwitcher'
import WellbeingCard from '../components/status/WellbeingCard'
import AlertBanner from '../components/status/AlertBanner'
import RecommendationsGrid from '../components/status/RecommendationsGrid'
import VitalMiniCard from '../components/vitals/VitalMiniCard'
import VitalsChart from '../components/vitals/VitalsChart'
import ThresholdLegend from '../components/vitals/ThresholdLegend'
import { useScenario } from '../context/ScenarioContext'
import { computeWellbeing } from '../utils/wellbeing'
import { generateRecommendations } from '../mocks/recommendations'
import { formatTime } from '../utils/format'

export default function VitalData() {
  const { scenario, scenarioKey } = useScenario()
  const wellbeing = useMemo(() => computeWellbeing(scenario.vitals), [scenario])
  const recommendations = useMemo(
    () => generateRecommendations(scenarioKey, scenario.vitals),
    [scenarioKey, scenario],
  )

  return (
    <div className="h-full overflow-y-auto px-4 py-4 md:px-8 md:py-6">
      <div className="flex flex-col gap-5 pb-4">
        <ScenarioSwitcher />

        {wellbeing.level === 'critical' && <AlertBanner />}

        <WellbeingCard wellbeing={wellbeing} />

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">Valeurs en temps réel</h2>
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
          <h2 className="text-sm font-semibold text-text-primary">Évolution</h2>
          <VitalsChart />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-text-primary">Recommandations</h2>
          <RecommendationsGrid recommendations={recommendations} />
        </section>
      </div>
    </div>
  )
}
