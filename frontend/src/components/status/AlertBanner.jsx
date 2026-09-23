import Icon from '../ui/Icon'

/**
 * Indicateur visible quand une alerte a été transmise au médecin de bord
 * (cahier des charges §4, page 1). N'affiche jamais de contenu médical :
 * juste la confirmation que le médecin a été prévenu.
 */
export default function AlertBanner() {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm"
      style={{ backgroundColor: 'var(--color-status-critical-soft)', color: 'var(--color-status-critical)' }}
    >
      <Icon name="ShieldAlert" size={20} />
      <p className="font-medium">
        Une alerte a été transmise au médecin de bord au vu de tes constantes actuelles.
      </p>
    </div>
  )
}
