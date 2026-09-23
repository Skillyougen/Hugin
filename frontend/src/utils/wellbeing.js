import { getVitalStatus } from './thresholds'

const STATUS_SCORE = { good: 100, warning: 55, critical: 15 }
const WEIGHTS = { heartRate: 0.3, spo2: 0.3, temperature: 0.2, sleepHours: 0.2 }

/**
 * Calcule un score de bien-être (0-100) et un niveau (vert/orange/rouge) à
 * partir des constantes. C'est une approximation front-only pour la démo :
 * la vraie logique d'analyse vit côté backend (moteur de règles + IA), voir
 * backend/app/ai/recommender.py — ne pas dupliquer cette règle ailleurs,
 * la remplacer par l'appel API une fois le contrat défini.
 */
export function computeWellbeing(vitals) {
  let score = 0
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    const status = getVitalStatus(key, vitals[key])
    score += STATUS_SCORE[status] * weight
  }
  score = Math.round(score)

  let level = 'good'
  let label = 'État stable'
  if (score < 45) {
    level = 'critical'
    label = 'Risque élevé'
  } else if (score < 75) {
    level = 'warning'
    label = 'Vigilance recommandée'
  }

  return { score, level, label }
}
