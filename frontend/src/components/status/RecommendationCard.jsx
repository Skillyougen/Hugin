import Card from '../ui/Card'
import Icon from '../ui/Icon'
import { RECOMMENDATION_CATEGORIES } from '../../mocks/recommendations'

export default function RecommendationCard({ recommendation }) {
  const category = RECOMMENDATION_CATEGORIES[recommendation.category]

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand-soft text-ocean-700">
          <Icon name={category.icon} size={19} />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{category.label}</p>
          <h3 className="text-sm font-semibold text-text-primary">{recommendation.title}</h3>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-text-secondary">{recommendation.text}</p>
      {recommendation.source === 'regles' && (
        <p className="mt-auto flex items-center gap-1.5 text-[11px] text-text-muted">
          <Icon name="ShieldCheck" size={13} />
          Proposé par le moteur de secours (mode dégradé)
        </p>
      )}
    </Card>
  )
}
