import { STATUS_META } from '../../utils/thresholds'

/** Anneau de progression circulaire (score de bien-être). */
export default function ScoreRing({ score, level, size = 112, strokeWidth = 10, label }) {
  const meta = STATUS_META[level] ?? STATUS_META.good
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - score / 100)
  const small = size < 60

  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--hg-sunken)" strokeWidth={strokeWidth} />
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
          style={{ transition: 'stroke-dashoffset .6s ease' }}
        />
      </svg>
      <div className="flex flex-col items-center">
        <span className={`${small ? 'text-sm' : 'text-2xl'} font-semibold leading-none text-text-primary`}>{score}</span>
        {label && <span className="mt-0.5 text-[11px] text-text-muted">{label}</span>}
      </div>
    </div>
  )
}
