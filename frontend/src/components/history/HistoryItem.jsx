import Card from '../ui/Card'
import Icon from '../ui/Icon'
import StatusBadge from '../ui/StatusBadge'
import { RECOMMENDATION_CATEGORIES } from '../../data/categories'
import { formatDateTime } from '../../utils/format'

export default function HistoryItem({ entry }) {
  const category = RECOMMENDATION_CATEGORIES[entry.category]

  return (
    <Card className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tile text-ocean-700 dark:text-ocean-300">
        <Icon name={category.icon} size={18} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
          {category.label} · {formatDateTime(entry.date)}
        </span>
        <StatusBadge level={entry.wellbeing.level} label={`Score ${entry.wellbeing.score}`} />
        <span className="text-sm font-semibold text-text-primary">{entry.title}</span>
        <p className="m-0 text-sm leading-5 text-text-secondary">{entry.text}</p>
      </div>
    </Card>
  )
}
