import { STATUS_META } from '../../utils/thresholds'

/** Anneau de progression circulaire (score de bien-être / indicateurs). */
export default function ScoreRing({ score, level, size = 112, strokeWidth = 10, label }) {
  const meta = STATUS_META[level] ?? STATUS_META.good
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - score / 100)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-surface-sunken)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={meta.color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 500ms ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-semibold text-text-primary">{score}</span>
        {label && <span className="text-[11px] text-text-muted">{label}</span>}
      </div>
    </div>
  )
}
