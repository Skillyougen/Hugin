import { SCENARIOS } from './scenarios'

// Générateur pseudo-aléatoire déterministe : même rendu à chaque ouverture.
function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

/**
 * Série de points pour le graphique d'évolution (page Données). Front-only :
 * à remplacer par l'API d'historique des mesures.
 */
export function generateVitalsSeries(scenarioKey, range = '24h') {
  const scenario = SCENARIOS[scenarioKey] ?? SCENARIOS.normal
  const points = range === '7j' ? 7 : 12
  const random = seededRandom(scenarioKey.length * 97 + points)
  const trendsUp = scenarioKey === 'crise'

  return Array.from({ length: points }, (_, i) => {
    const progress = i / (points - 1)
    const drift = trendsUp ? progress * 0.12 : 0
    const jitter = (value, amplitude) => value * (1 + (random() - 0.5) * amplitude + drift)
    const label = range === '7j' ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i] : `${String(i * 2).padStart(2, '0')}h`
    return {
      label,
      heartRate: Math.round(jitter(scenario.vitals.heartRate, 0.08)),
      spo2: Math.min(100, Math.round(jitter(scenario.vitals.spo2, 0.02))),
      temperature: Math.round(jitter(scenario.vitals.temperature, 0.015) * 10) / 10,
    }
  })
}
