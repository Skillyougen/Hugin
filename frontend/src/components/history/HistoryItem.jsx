import Card from '../ui/Card'
import Icon from '../ui/Icon'
import StatusBadge from '../ui/StatusBadge'
import { RECOMMENDATION_CATEGORIES } from '../../mocks/recommendations'
import { formatDateTime } from '../../utils/format'

export default function HistoryItem({ entry }) {
  const category = RECOMMENDATION_CATEGORIES[entry.category]

  return (
    <Card className="flex items-start gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-brand-soft text-ocean-700">
        <Icon name={category.icon} size={18} />
      </span>

      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {category.label} · {formatDateTime(entry.date)}
          </p>
          <StatusBadge level={entry.wellbeing.level} label={`Score ${entry.wellbeing.score}`} />
        </div>
        <h3 className="text-sm font-semibold text-text-primary">{entry.title}</h3>
        <p className="text-sm leading-relaxed text-text-secondary">{entry.text}</p>
      </div>
    </Card>
  )
}
