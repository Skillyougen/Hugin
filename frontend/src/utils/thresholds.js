/**
 * Seuils d'affichage des constantes (vert / orange / rouge par carte).
 *
 * DOIVENT rester identiques à backend/app/seuils.py, qui décide de l'état
 * global, des recommandations et du protocole : sinon une carte s'afficherait
 * orange alors que le backend compte la valeur normale (ou l'inverse).
 * Valeurs illustratives de prototype, sans valeur médicale.
 *   FC : vert 50-100, orange 40-120 · SpO2 : vert >= 95, orange >= 90
 *   Température : vert 36,1-37,5, orange 35,5-38,5 · Sommeil : vert >= 6 h, orange >= 4 h
 */
export const VITALS = {
  heartRate: { key: 'heartRate', label: 'Fréquence cardiaque', shortLabel: 'FC', unit: 'bpm', icon: 'HeartPulse', normal: [50, 100], warning: [40, 120] },
  spo2: { key: 'spo2', label: 'Saturation en oxygène', shortLabel: 'SpO₂', unit: '%', icon: 'Wind', normal: [95, 100], warning: [90, 100] },
  temperature: { key: 'temperature', label: 'Température corporelle', shortLabel: 'Température', unit: '°C', icon: 'Thermometer', normal: [36.1, 37.5], warning: [35.5, 38.5] },
  sleepHours: { key: 'sleepHours', label: 'Sommeil (dernière nuit)', shortLabel: 'Sommeil', unit: 'h', icon: 'Moon', normal: [6, 24], warning: [4, 24] },
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
