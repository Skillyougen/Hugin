import { STATUS_META } from '../../utils/thresholds'

/** Pastille de couleur + libellé pour un niveau vert / orange / rouge. */
export default function StatusBadge({ level, label }) {
  const meta = STATUS_META[level] ?? STATUS_META.good
  return (
    <span className="inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1" style={{ backgroundColor: meta.soft }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      <span className="text-xs font-medium" style={{ color: meta.color === '#f59e0b' ? '#b45309' : meta.color === '#22c55e' ? '#15803d' : '#b91c1c' }}>
        {label ?? meta.label}
      </span>
    </span>
  )
}
