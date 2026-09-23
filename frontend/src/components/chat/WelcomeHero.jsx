import Foxy from '../mascot/Foxy'
import ScoreRing from '../ui/ScoreRing'
import StatusBadge from '../ui/StatusBadge'
import { moodFromVitals } from '../mascot/useFoxyMood'
import { useAuth } from '../../context/AuthContext'

export const STARTERS = ['Je suis fatigué', 'J’ai mal dormi', 'Ça va bien', 'Exercice de respiration']
export const NIGHT_STARTERS = ['Je n’arrive pas à dormir', 'Respiration pour s’endormir']

/**
 * Vrai écran d'accueil (tant qu'aucun message n'a été envoyé) : Foxy porte
 * l'état global, une pastille de score, et des amorces pour éviter l'écran vide.
 */
export default function WelcomeHero({ wellbeing, onPick, night }) {
  const { colon } = useAuth()
  const mood = night ? 'sleepy' : wellbeing?.level === 'good' ? 'cheer' : moodFromVitals({ status: wellbeing?.level })
  const starters = night ? NIGHT_STARTERS : STARTERS

  return (
    <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-5 py-6 text-center">
      <Foxy mood={mood} size={196} />
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">
        {night ? `Bonne nuit, ${colon.nom}` : `Bonjour ${colon.nom}`}
      </h1>
      <p className="mt-0.5 text-base text-text-secondary">{night ? 'Quart de nuit à bord' : 'Comment te sens-tu aujourd’hui ?'}</p>

      {!night && !wellbeing && (
        <p className="mt-5 max-w-sm rounded-2xl border border-surface-border bg-surface-card px-4 py-3 text-sm text-text-secondary">
          Aucune donnée pour l'instant : importe ta première mesure dans « Données » pour voir ton état global.
        </p>
      )}

      {!night && wellbeing && (
        <div className="mt-5 flex items-center gap-3 rounded-full border border-surface-border bg-surface-card py-2.5 pl-3 pr-4 shadow-[0_8px_16px_-12px_rgba(16,24,38,.35)]">
          <ScoreRing score={wellbeing.score} level={wellbeing.level} size={46} strokeWidth={6} />
          <div className="text-left">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">État global</div>
            <div className="text-sm font-semibold text-text-primary">{wellbeing.label}</div>
          </div>
          <StatusBadge level={wellbeing.level} />
        </div>
      )}

      <p className="mb-2 mt-6 text-[11px] font-semibold uppercase tracking-wider text-text-muted">{night ? 'En silence' : 'Pour démarrer'}</p>
      <div className="flex max-w-md flex-wrap justify-center gap-2">
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
