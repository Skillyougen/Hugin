import Card from '../ui/Card'
import Icon from '../ui/Icon'
import { VITALS, getVitalStatus, STATUS_META } from '../../utils/thresholds'
import { formatNumber } from '../../utils/format'

/** Carte compacte pour une constante (FC, SpO₂, température, sommeil). */
export default function VitalMiniCard({ vitalKey, value }) {
  const def = VITALS[vitalKey]
  const status = getVitalStatus(vitalKey, value)
  const meta = STATUS_META[status]
  const digits = vitalKey === 'temperature' || vitalKey === 'sleepHours' ? 1 : 0

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: meta.soft, color: meta.color }}>
          <Icon name={def.icon} size={18} />
        </span>
        {status !== 'good' && (
          <Icon name={status === 'critical' ? 'TriangleAlert' : 'CircleAlert'} size={16} color={meta.color} aria-label={meta.label} />
        )}
      </div>
      <div>
        <div className="text-xs text-text-muted">{def.shortLabel}</div>
        <div className="text-2xl font-semibold text-text-primary">
          {formatNumber(value, digits)}
          <span className="text-sm font-normal text-text-muted"> {def.unit}</span>
        </div>
      </div>
    </Card>
  )
}
