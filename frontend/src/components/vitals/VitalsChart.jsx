import { useEffect, useMemo, useRef, useState } from 'react'
import Card from '../ui/Card'
import { VITALS } from '../../utils/thresholds'
import { generateVitalsSeries } from '../../mocks/vitalsSeries'
import { useScenario } from '../../context/ScenarioContext'

const CHART_METRICS = ['heartRate', 'spo2', 'temperature']
const RANGES = [
  { key: '24h', label: '24 h' },
  { key: '7j', label: '7 jours' },
]
const CHART_HEIGHT = 200
const PADDING = { top: 16, right: 12, bottom: 24, left: 28 }

function Pill({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${active ? 'bg-surface-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}
    >
      {label}
    </button>
  )
}

/** Graphique d'évolution — SVG maison, pas de lib tierce. */
export default function VitalsChart() {
  const { scenarioKey } = useScenario()
  const [range, setRange] = useState('24h')
  const [metric, setMetric] = useState('heartRate')
  const [width, setWidth] = useState(0)
  const boxRef = useRef(null)

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const data = useMemo(() => generateVitalsSeries(scenarioKey, range), [scenarioKey, range])
  const def = VITALS[metric]

  const { path, points, yTicks } = useMemo(() => {
    if (width <= 0) return { path: '', points: [], yTicks: [] }
    const values = data.map((d) => d[metric])
    const min = Math.min(...values)
    const max = Math.max(...values)
    const span = max - min || 1
    const innerW = width - PADDING.left - PADDING.right
    const innerH = CHART_HEIGHT - PADDING.top - PADDING.bottom
    const pts = data.map((d, i) => ({
      x: PADDING.left + (i / (data.length - 1 || 1)) * innerW,
      y: PADDING.top + (1 - (d[metric] - min) / span) * innerH,
      label: d.label,
    }))
    return {
      path: pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' '),
      points: pts,
      yTicks: [min, min + span / 2, max].map((v) => Math.round(v * 10) / 10),
    }
  }, [data, metric, width])

  const step = Math.ceil(points.length / 6 || 1)

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-full bg-surface-sunken p-1">
          {CHART_METRICS.map((key) => (
            <Pill key={key} active={metric === key} label={VITALS[key].shortLabel} onClick={() => setMetric(key)} />
          ))}
        </div>
        <div className="flex gap-1 rounded-full bg-surface-sunken p-1">
          {RANGES.map(({ key, label }) => (
            <Pill key={key} active={range === key} label={label} onClick={() => setRange(key)} />
          ))}
        </div>
      </div>

      <div ref={boxRef} style={{ height: CHART_HEIGHT }}>
        {width > 0 && (
          <svg width={width} height={CHART_HEIGHT} role="img" aria-label={`${def.label}, évolution`}>
            <defs>
              <linearGradient id="hg-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            {yTicks.map((tick, i) => {
              const y = PADDING.top + (1 - i / (yTicks.length - 1 || 1)) * (CHART_HEIGHT - PADDING.top - PADDING.bottom)
              return (
                <g key={`${tick}-${i}`}>
                  <line x1={PADDING.left} x2={width - PADDING.right} y1={y} y2={y} stroke="var(--hg-border)" strokeWidth="1" />
                  <text x="0" y={y + 3} fontSize="10" fill="var(--hg-muted)">{tick}</text>
                </g>
              )
            })}
            <path d={path} stroke="url(#hg-line)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {points
              .filter((_, i) => i % step === 0)
              .map((p) => (
                <text key={p.label} x={p.x} y={CHART_HEIGHT - 6} fontSize="10" fill="var(--hg-muted)" textAnchor="middle">
                  {p.label}
                </text>
              ))}
          </svg>
        )}
      </div>
      <p className="m-0 text-center text-[11px] text-text-muted">
        {def.label} ({def.unit})
      </p>
    </Card>
  )
}
