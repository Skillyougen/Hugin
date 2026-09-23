import Icon from '../ui/Icon'

/**
 * Indicateur visible quand une alerte a été transmise au médecin de bord
 * (cahier des charges §4). N'affiche jamais de contenu médical.
 */
export default function AlertBanner() {
  return (
    <div role="status" className="flex items-center gap-3 rounded-2xl bg-status-critical-soft px-4 py-3 text-[#b91c1c]">
      <Icon name="ShieldAlert" size={20} className="shrink-0" />
      <p className="m-0 text-sm font-medium">Une alerte a été transmise au médecin de bord au vu de tes constantes actuelles.</p>
    </div>
  )
}
