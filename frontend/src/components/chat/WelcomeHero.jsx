import Foxy from '../mascot/Foxy'
import { moodFromVitals } from '../mascot/useFoxyMood'
import { useAuth } from '../../context/AuthContext'

export const STARTERS = ['Je suis fatigué·e', 'J’ai mal dormi', 'Je me sens seul·e', 'Je suis stressé·e']
export const NIGHT_STARTERS = ['Je n’arrive pas à dormir', 'J’ai besoin de parler']

/** Accueil du chat (tant qu'aucun message) : Foxy, salutation et amorces de conversation. */
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
