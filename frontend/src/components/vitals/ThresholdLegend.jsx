import { STATUS_META } from '../../utils/thresholds'

/** Légende de la mise en évidence des valeurs hors seuil (page données). */
export default function ThresholdLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
      {Object.entries(STATUS_META).map(([key, meta]) => (
        <span key={key} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
          {meta.label}
        </span>
      ))}
    </div>
  )
}
