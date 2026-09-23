/**
 * Seuils des constantes vitales.
 *
 * ⚠️ Valeurs indicatives pour le prototype (démo), à valider avec le bloc
 * "Assistant IA" / le référent médical de l'équipe. Ne PAS interpréter ces
 * seuils comme un avis médical : ils ne servent qu'à colorer l'UI et
 * déclencher les recommandations de démonstration.
 *
 * Quand le vrai contrat d'API existera (docs/contrat-interface.md), ces
 * seuils devront être alignés avec ceux du moteur de règles backend
 * (backend/app/ai/recommender.py) plutôt que dupliqués ici.
 */
export const VITALS = {
  heartRate: {
    key: 'heartRate',
    label: 'Fréquence cardiaque',
    shortLabel: 'FC',
    unit: 'bpm',
    icon: 'HeartPulse',
    normal: [55, 90],
    warning: [45, 110],
  },
  spo2: {
    key: 'spo2',
    label: 'Saturation en oxygène',
    shortLabel: 'SpO₂',
    unit: '%',
    icon: 'Wind',
    normal: [96, 100],
    warning: [92, 100],
  },
  temperature: {
    key: 'temperature',
    label: 'Température corporelle',
    shortLabel: 'Température',
    unit: '°C',
    icon: 'Thermometer',
    normal: [36.1, 37.5],
    warning: [35.5, 38.2],
  },
  sleepHours: {
    key: 'sleepHours',
    label: 'Sommeil (dernière nuit)',
    shortLabel: 'Sommeil',
    unit: 'h',
    icon: 'Moon',
    normal: [7, 10],
    warning: [5, 10],
  },
}

/** Retourne 'good' | 'warning' | 'critical' pour une valeur donnée d'une constante. */
export function getVitalStatus(vitalKey, value) {
  const def = VITALS[vitalKey]
  if (!def || value == null) return 'good'
  const [normalMin, normalMax] = def.normal
  const [warningMin, warningMax] = def.warning
  if (value >= normalMin && value <= normalMax) return 'good'
  if (value >= warningMin && value <= warningMax) return 'warning'
  return 'critical'
}

export const STATUS_META = {
  good: { label: 'Normal', color: 'var(--color-status-good)', soft: 'var(--color-status-good-soft)' },
  warning: { label: 'À surveiller', color: 'var(--color-status-warning)', soft: 'var(--color-status-warning-soft)' },
  critical: { label: 'Critique', color: 'var(--color-status-critical)', soft: 'var(--color-status-critical-soft)' },
}
