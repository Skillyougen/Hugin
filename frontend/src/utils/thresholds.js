/**
 * Seuils des constantes vitales.
 *
 * ⚠️ Valeurs indicatives pour le prototype, à valider avec le référent
 * médical. Ne PAS interpréter comme un avis médical : elles ne servent qu'à
 * colorer l'UI et déclencher les recommandations de démonstration.
 */
export const VITALS = {
  heartRate: { key: 'heartRate', label: 'Fréquence cardiaque', shortLabel: 'FC', unit: 'bpm', icon: 'HeartPulse', normal: [55, 90], warning: [45, 110] },
  spo2: { key: 'spo2', label: 'Saturation en oxygène', shortLabel: 'SpO₂', unit: '%', icon: 'Wind', normal: [96, 100], warning: [92, 100] },
  temperature: { key: 'temperature', label: 'Température corporelle', shortLabel: 'Température', unit: '°C', icon: 'Thermometer', normal: [36.1, 37.5], warning: [35.5, 38.2] },
  sleepHours: { key: 'sleepHours', label: 'Sommeil (dernière nuit)', shortLabel: 'Sommeil', unit: 'h', icon: 'Moon', normal: [7, 10], warning: [5, 10] },
}

/** 'good' | 'warning' | 'critical' pour une valeur donnée d'une constante. */
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
  good: { label: 'Normal', color: '#22c55e', soft: '#dcfce7' },
  warning: { label: 'À surveiller', color: '#f59e0b', soft: '#fef3c7' },
  critical: { label: 'Critique', color: '#ef4444', soft: '#fee2e2' },
}
