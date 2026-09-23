import Card from '../ui/Card'
import ScoreRing from '../ui/ScoreRing'
import StatusBadge from '../ui/StatusBadge'
import Foxy from '../mascot/Foxy'
import { moodFromVitals } from '../mascot/useFoxyMood'

/**
 * Carte d'état global : score + code couleur, doublé par l'humeur de Foxy
 * (signal non chromatique : good → heureux, warning → inquiet, critical → alerte).
 */
export default function WellbeingCard({ wellbeing, name }) {
  const mood = moodFromVitals({ status: wellbeing.level, score: wellbeing.score })
  return (
    <Card className="flex items-center gap-4">
      <ScoreRing score={wellbeing.score} level={wellbeing.level} size={88} strokeWidth={9} label="/ 100" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">État global de {name}</span>
        <span className="text-lg font-semibold text-text-primary">{wellbeing.label}</span>
        <StatusBadge level={wellbeing.level} />
      </div>
      <div className="-my-3 shrink-0">
        <Foxy mood={mood} size={96} />
      </div>
    </Card>
  )
}
