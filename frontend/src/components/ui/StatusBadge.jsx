import { STATUS_META } from '../../utils/thresholds'

/** Pastille de couleur + libellé pour un niveau vert / orange / rouge. */
export default function StatusBadge({ level, label }) {
  const meta = STATUS_META[level] ?? STATUS_META.good
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: meta.soft, color: meta.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      {label ?? meta.label}
    </span>
  )
}
