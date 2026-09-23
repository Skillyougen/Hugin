import { useEffect, useRef, useState } from 'react'

/**
 * Choix de l'humeur de Foxy — « les deux combinés » :
 * l'état des constantes (score / niveau) donne l'humeur de fond, le dernier
 * message du colon peut la surclasser le temps d'un échange, et la phase du
 * chat (saisie, réponse en cours) gagne toujours.
 *
 * Garde-fou : aucune de ces règles ne qualifie un symptôme. `alert`
 * accompagne une orientation vers le médecin de bord, rien d'autre.
 */

/** Mots-clés → humeur. Ordre = priorité décroissante. */
const KEYWORDS = [
  { mood: 'alert', words: ['urgence', 'grave', 'douleur', 'souffre', 'sang', 'malaise'] },
  { mood: 'sad', words: ['seul', 'seule', 'isolé', 'isolée', 'triste', 'déprimé', 'manque'] },
  { mood: 'worried', words: ['stress', 'stressé', 'stressée', 'anxieux', 'anxieuse', 'angoisse', 'peur'] },
  { mood: 'sleepy', words: ['dormir', 'dormi', 'sommeil', 'insomnie', 'fatigue', 'fatigué', 'fatiguée', 'épuisé', 'crevé'] },
  { mood: 'cheer', words: ['respiration', 'respirer', 'calme', 'exercice'] },
  { mood: 'happy', words: ['merci', 'mieux', 'super', 'content', 'ça va', 'bien'] },
]

const strip = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export function moodFromMessage(text) {
  if (!text) return null
  const t = strip(text)
  for (const { mood, words } of KEYWORDS) {
    if (words.some((w) => t.includes(strip(w)))) return mood
  }
  return null
}

export function moodFromVitals({ status, score, hour, milestone } = {}) {
  if (status === 'critical') return 'alert'
  if (milestone) return 'proud'
  if (status === 'warning') return 'worried'
  if (typeof hour === 'number' && (hour >= 23 || hour < 6)) return 'sleepy'
  if (typeof score === 'number' && score >= 80) return 'happy'
  return 'neutral'
}

/**
 * Humeur effective. Une humeur issue d'un message tient `holdMs` avant de
 * retomber sur l'humeur de fond.
 * ctx : { score, status, phase: 'idle'|'userTyping'|'assistantThinking', lastUserMessage, hour, milestone }
 */
export function useFoxyMood(ctx, holdMs = 6000) {
  const base = moodFromVitals(ctx)
  const [reaction, setReaction] = useState(null)
  const seen = useRef(undefined)

  useEffect(() => {
    if (ctx.lastUserMessage === seen.current) return
    seen.current = ctx.lastUserMessage
    const next = moodFromMessage(ctx.lastUserMessage)
    if (!next) return
    setReaction(next)
    const id = setTimeout(() => setReaction(null), holdMs)
    return () => clearTimeout(id)
  }, [ctx.lastUserMessage, holdMs])

  if (ctx.phase === 'userTyping') return 'listening'
  if (ctx.phase === 'assistantThinking') return 'thinking'
  // Une alerte critique ne se laisse jamais masquer par une réaction.
  if (base === 'alert') return 'alert'
  return reaction ?? base
}
