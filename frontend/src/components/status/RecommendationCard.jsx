import Card from '../ui/Card'
import Icon from '../ui/Icon'
import { RECOMMENDATION_CATEGORIES } from '../../mocks/recommendations'

export default function RecommendationCard({ recommendation }) {
  const category = RECOMMENDATION_CATEGORIES[recommendation.category]

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tile text-ocean-700 dark:text-ocean-300">
          <Icon name={category.icon} size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium uppercase tracking-wide text-text-muted">{category.label}</div>
          <div className="text-sm font-semibold text-text-primary">{recommendation.title}</div>
        </div>
      </div>
      <p className="m-0 text-sm leading-5 text-text-secondary">{recommendation.text}</p>
      {recommendation.source === 'regles' && (
        <div className="flex items-center gap-1.5 text-text-muted">
          <Icon name="ShieldCheck" size={13} />
          <span className="text-[11px]">Proposé par le moteur de secours (mode dégradé)</span>
        </div>
      )}
    </Card>
  )
}
