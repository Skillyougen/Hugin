import { useState } from 'react'
import Card from '../ui/Card'
import Icon from '../ui/Icon'

/**
 * Protocole de premiers secours guidé, actif quand l'état est rouge
 * (cahier des charges §4/§8). Contenu figé côté backend (protocoles/*.json) ;
 * cette carte ne fait qu'avancer d'étape via `POST /protocole/etape-suivante`.
 */
export default function ActiveProtocolCard({ protocole, onEtapeSuivante, readOnly = false }) {
  const [pending, setPending] = useState(false)

  async function handleNext() {
    setPending(true)
    try {
      await onEtapeSuivante()
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-[#b91c1c]">
        <Icon name="ShieldAlert" size={20} />
        <h2 className="m-0 text-sm font-semibold">{protocole.titre}</h2>
      </div>
      <ol className="m-0 flex flex-col gap-2 pl-5 text-sm text-text-secondary">
        {protocole.etapes.map((etape, i) => (
          <li key={etape} className={i === protocole.etape_courante ? 'font-semibold text-text-primary' : i < protocole.etape_courante ? 'text-text-muted line-through' : ''}>
            {etape}
          </li>
        ))}
      </ol>
      {protocole.prescription && (
        <p className="m-0 rounded-xl bg-surface-sunken p-3 text-xs text-text-secondary">
          {protocole.prescription.medicament} — {protocole.prescription.dosage}, {protocole.prescription.duree}
          {protocole.prescription.utilise_alternative && ' (alternative de stock)'}
          {protocole.prescription.stock_restant != null &&
            ` — il reste ${protocole.prescription.stock_restant} dose${protocole.prescription.stock_restant > 1 ? 's' : ''} à bord`}
        </p>
      )}
      {!readOnly && !protocole.termine && (
        <p className="m-0 text-xs font-medium text-[#b91c1c]">Une alerte a été diffusée à l'équipage.</p>
      )}
      {readOnly ? (
        <p className="m-0 text-xs text-text-muted">
          {protocole.termine ? 'Protocole terminé — alerte résolue.' : 'Lecture seule : seul le colon concerné avance les étapes.'}
        </p>
      ) : protocole.termine ? (
        <p className="m-0 text-xs font-medium text-status-good">Protocole terminé — alerte résolue.</p>
      ) : (
        <button
          type="button"
          onClick={handleNext}
          disabled={pending}
          className="self-start rounded-full bg-status-critical px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? '…' : 'Étape suivante'}
        </button>
      )}
    </Card>
  )
}
