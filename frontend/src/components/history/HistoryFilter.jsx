import { RECOMMENDATION_CATEGORIES } from '../../mocks/recommendations'

/** Filtre par type de recommandation — fonctionnalité bonus du cahier des charges. */
export default function HistoryFilter({ value, onChange }) {
  const options = [{ key: 'all', label: 'Tout' }, ...Object.entries(RECOMMENDATION_CATEGORIES).map(([key, c]) => ({ key, label: c.label }))]

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            value === option.key
              ? 'gradient-brand text-white'
              : 'bg-surface-sunken text-text-secondary hover:bg-surface-border'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
