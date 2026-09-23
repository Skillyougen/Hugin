import Card from '../ui/Card'
import ScoreRing from '../ui/ScoreRing'
import StatusBadge from '../ui/StatusBadge'
import { colon } from '../../mocks/colon'

/** Carte d'état global de l'accueil : score de bien-être + code couleur. */
export default function WellbeingCard({ wellbeing }) {
  return (
    <Card className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">
      <ScoreRing score={wellbeing.score} level={wellbeing.level} label="/ 100" />
      <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
          État global de {colon.firstName}
        </p>
        <h2 className="text-xl font-semibold text-text-primary">{wellbeing.label}</h2>
        <StatusBadge level={wellbeing.level} />
      </div>
    </Card>
  )
}
