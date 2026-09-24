import { Link } from 'react-router-dom'
import Foxy from '../mascot/Foxy'
import ScoreRing from '../ui/ScoreRing'
import StatusBadge from '../ui/StatusBadge'
import { moodFromVitals } from '../mascot/useFoxyMood'
import { useAuth } from '../../context/AuthContext'

export const STARTERS = ['Je suis fatigué·e', 'J’ai mal dormi', 'Je me sens seul·e', 'Je suis stressé·e']
export const NIGHT_STARTERS = ['Je n’arrive pas à dormir', 'J’ai besoin de parler']

/** Accueil (tant qu'aucun message) : Foxy, salutation, état global et amorces de conversation. */
export default function ChatHero({ wellbeing, onPick, night }) {
  const { colon } = useAuth()
  const mood = night ? 'sleepy' : wellbeing?.level === 'good' ? 'cheer' : moodFromVitals({ status: wellbeing?.level })
  const starters = night ? NIGHT_STARTERS : STARTERS

  return (
    <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-5 py-6 text-center">
      <Foxy mood={mood} size={180} />
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">
        {night ? `Bonne nuit, ${colon.nom}` : `Bonjour ${colon.nom}`}
      </h1>
      <p className="mt-0.5 text-base text-text-secondary">{night ? 'Je suis là si tu veux parler' : 'De quoi as-tu envie de parler ?'}</p>
      {/* §4 : pas d'état vert par défaut, on invite au premier import. */}
      {wellbeing ? (
        <div className="mt-5 flex items-center gap-3 rounded-full border border-surface-border bg-surface-card py-2.5 pl-3 pr-4 shadow-[0_8px_16px_-12px_rgba(16,24,38,.35)]">
          <ScoreRing score={wellbeing.score} level={wellbeing.level} size={46} strokeWidth={6} />
          <div className="text-left">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">État global</div>
            <div className="text-sm font-semibold text-text-primary">{wellbeing.label}</div>
          </div>
          <StatusBadge level={wellbeing.level} />
        </div>
      ) : (
        <p className="mt-5 max-w-sm rounded-2xl border border-surface-border bg-surface-card px-4 py-3 text-sm text-text-secondary">
          Aucune donnée pour l'instant. <Link to="/donnees" className="font-medium">Importe tes constantes</Link> pour voir ton état global et tes recommandations.
        </p>
      )}
      <div className="mt-6 flex max-w-md flex-wrap justify-center gap-2">
        {starters.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="whitespace-nowrap rounded-full border border-surface-border bg-surface-card px-3.5 py-2.5 text-[13px] text-text-secondary transition-colors hover:border-ocean-300 hover:text-text-primary"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
