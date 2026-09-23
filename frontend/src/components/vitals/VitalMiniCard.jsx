import Card from '../ui/Card'
import Icon from '../ui/Icon'
import { VITALS, getVitalStatus, STATUS_META } from '../../utils/thresholds'
import { formatNumber } from '../../utils/format'

/**
 * Carte compacte pour une constante (FC, SpO2, température, sommeil).
 * Réutilisée sur l'accueil (résumé) et la page données (grille temps réel).
 */
export default function VitalMiniCard({ vitalKey, value, compact = false }) {
  const def = VITALS[vitalKey]
  const status = getVitalStatus(vitalKey, value)
  const meta = STATUS_META[status]
  const digits = vitalKey === 'temperature' || vitalKey === 'sleepHours' ? 1 : 0

  return (
    <Card className={`flex flex-col gap-3 ${compact ? 'p-4' : ''}`}>
      <div className="flex items-center justify-between">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: meta.soft, color: meta.color }}
        >
          <Icon name={def.icon} size={18} />
        </span>
        {status !== 'good' && (
          <Icon
            name={status === 'critical' ? 'AlertTriangle' : 'AlertCircle'}
            size={16}
            style={{ color: meta.color }}
          />
        )}
      </div>
      <div>
        <p className="text-xs text-text-muted">{def.shortLabel}</p>
        <p className="text-2xl font-semibold text-text-primary">
          {formatNumber(value, digits)}
          <span className="ml-1 text-sm font-normal text-text-muted">{def.unit}</span>
        </p>
      </div>
    </Card>
  )
}
