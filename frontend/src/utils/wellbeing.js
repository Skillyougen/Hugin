import { getVitalStatus } from './thresholds'

const STATUS_SCORE = { good: 100, warning: 55, critical: 15 }
const WEIGHTS = { heartRate: 0.3, spo2: 0.3, temperature: 0.2, sleepHours: 0.2 }

/**
 * Score de bien-être (0-100) et niveau (vert/orange/rouge). Approximation
 * front-only pour la démo — la vraie logique vit côté backend.
 */
export function computeWellbeing(vitals) {
  let score = 0
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    score += STATUS_SCORE[getVitalStatus(key, vitals[key])] * weight
  }
  score = Math.round(score)

  if (score < 45) return { score, level: 'critical', label: 'Risque élevé' }
  if (score < 75) return { score, level: 'warning', label: 'Vigilance recommandée' }
  return { score, level: 'good', label: 'État stable' }
}
