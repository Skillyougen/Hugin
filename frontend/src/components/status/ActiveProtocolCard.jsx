import { useState } from 'react'
import Card from '../ui/Card'
import Icon from '../ui/Icon'

/**
 * Protocole de premiers secours guidé pas à pas (cahier des charges §4/§8),
 * actif quand l'état est rouge. Contenu figé côté backend (protocoles/*.json).
 *
 * Une seule étape est affichée à la fois ; le colon la valide avec
 * `POST /protocole/etape-suivante` pour passer à la suivante. L'équipage voit
 * la même carte en lecture seule, qui suit la progression du colon.
 * `etape_courante` = nombre d'étapes déjà validées = index de l'étape à faire.
 */
export default function ActiveProtocolCard({ protocole, onEtapeSuivante, readOnly = false }) {
  const [pending, setPending] = useState(false)
  const total = protocole.etapes.length
  const index = Math.min(protocole.etape_courante, total - 1)
  const derniere = index === total - 1
  // Vue équipage : texte rédigé pour la personne qui aide, pas pour celle en détresse.
  const aidant = protocole.vue === 'equipage'
  const p = protocole.prescription

  async function handleNext() {
    setPending(true)
    try {
      await onEtapeSuivante()
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-[#b91c1c]">
        <Icon name="ShieldAlert" size={20} />
        <h2 className="m-0 text-sm font-semibold">{protocole.titre}</h2>
      </div>

      {aidant && (
        <p className="m-0 rounded-xl bg-status-critical-soft p-3 text-sm font-medium text-[#b91c1c]">
          {protocole.colon_nom} a besoin d'aide. Suis ces étapes pour l'assister.
        </p>
      )}

      <div className="flex gap-1.5" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={protocole.etape_courante}>
        {protocole.etapes.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < protocole.etape_courante ? 'bg-status-good' : i === index && !protocole.termine ? 'bg-status-critical' : 'bg-surface-border'}`}
          />
        ))}
      </div>

      {protocole.termine ? (
        <p className="m-0 text-sm font-medium text-status-good">Protocole terminé — alerte résolue.</p>
      ) : (
        <>
          <div className="flex flex-col gap-2 rounded-2xl bg-surface-sunken p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Étape {index + 1} sur {total}
            </span>
            <p className="m-0 text-lg font-semibold leading-snug text-text-primary">{protocole.etapes[index]}</p>
          </div>

          {p && (protocole.etape_traitement != null ? index >= protocole.etape_traitement : derniere) && (
            <p className="m-0 rounded-xl border border-surface-border p-3 text-sm text-text-secondary">
              <strong className="text-text-primary">{aidant ? 'Traitement à faire prendre' : 'Traitement'} :</strong>{' '}
              {p.deja_prescrit && 'Déjà délivré récemment : pas de nouvelle dose, le stock est préservé. '}
              {p.medicament} — {p.dosage}, {p.duree}
              {p.utilise_alternative && ' (alternative, le médicament prévu n\'est pas à bord)'}
              {p.stock_restant != null && ` · il reste ${p.stock_restant} dose${p.stock_restant > 1 ? 's' : ''} à bord`}
            </p>
          )}

          {readOnly ? (
            <p className="m-0 text-xs text-text-muted">
              Suit la progression de {protocole.colon_nom} en direct. Seul·e {protocole.colon_nom} valide les étapes ; l'alerte se
              résout à la fin du protocole.
            </p>
          ) : (
            <>
              <button
                type="button"
                onClick={handleNext}
                disabled={pending}
                className="rounded-full bg-status-critical px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {pending ? '…' : derniere ? 'Terminer le protocole' : 'Étape faite, passer à la suivante'}
              </button>
              <p className="m-0 text-xs font-medium text-[#b91c1c]">Une alerte a été diffusée à l'équipage.</p>
            </>
          )}
        </>
      )}

      <details className="text-xs text-text-muted">
        <summary className="cursor-pointer select-none">Voir toutes les étapes</summary>
        <ol className="mb-0 mt-2 flex flex-col gap-1.5 pl-5">
          {protocole.etapes.map((etape, i) => (
            <li key={etape} className={i < protocole.etape_courante ? 'line-through' : i === index && !protocole.termine ? 'font-semibold text-text-primary' : ''}>
              {etape}
            </li>
          ))}
        </ol>
      </details>
    </Card>
  )
}
