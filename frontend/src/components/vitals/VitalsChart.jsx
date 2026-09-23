import { useMemo, useState } from 'react'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import Card from '../ui/Card'
import { VITALS } from '../../utils/thresholds'
import { generateVitalsSeries } from '../../mocks/vitalsSeries'
import { useScenario } from '../../context/ScenarioContext'

const CHART_METRICS = ['heartRate', 'spo2', 'temperature']
const RANGES = [
  { key: '24h', label: '24 h' },
  { key: '7j', label: '7 jours' },
]

export default function VitalsChart() {
  const { scenarioKey } = useScenario()
  const [range, setRange] = useState('24h')
  const [metric, setMetric] = useState('heartRate')

  const data = useMemo(() => generateVitalsSeries(scenarioKey, range), [scenarioKey, range])
  const def = VITALS[metric]

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-full bg-surface-sunken p-1">
          {CHART_METRICS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setMetric(key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                metric === key ? 'bg-surface-card text-text-primary shadow-card' : 'text-text-muted'
              }`}
            >
              {VITALS[key].shortLabel}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-full bg-surface-sunken p-1">
          {RANGES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setRange(key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                range === key ? 'bg-surface-card text-text-primary shadow-card' : 'text-text-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="vitalsLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--color-ocean-500)" />
                <stop offset="100%" stopColor="var(--color-mint-500)" />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--color-surface-border)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
              axisLine={{ stroke: 'var(--color-surface-border)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
              width={36}
              domain={['auto', 'auto']}
            />
            <Tooltip
              formatter={(value) => [`${value} ${def.unit}`, def.shortLabel]}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid var(--color-surface-border)',
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey={metric}
              stroke="url(#vitalsLineGradient)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
