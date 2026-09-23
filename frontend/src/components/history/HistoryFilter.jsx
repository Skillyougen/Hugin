import { RECOMMENDATION_CATEGORIES } from '../../data/categories'

/** Filtre par type de recommandation — fonctionnalité bonus du cahier des charges. */
export default function HistoryFilter({ value, onChange }) {
  const options = [{ key: 'all', label: 'Tout' }, ...Object.entries(RECOMMENDATION_CATEGORIES).map(([key, c]) => ({ key, label: c.label }))]

  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Filtrer par catégorie">
      {options.map((option) => {
        const active = value === option.key
        return (
          <button
            key={option.key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              active ? 'bg-linear-to-br from-ocean-500 to-mint-500 text-white' : 'bg-surface-sunken text-text-secondary hover:text-text-primary'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
