/**
 * Scénarios simulés (cahier des charges §2 : "normal, stressé, crise").
 * En attendant le simulateur de montre et l'API backend, ces valeurs
 * alimentent l'UI pour la démo.
 */
export const SCENARIOS = {
  normal: {
    key: 'normal',
    label: 'Normal',
    description: 'Constantes stables, aucune vigilance particulière.',
    vitals: { heartRate: 72, spo2: 98, temperature: 36.8, sleepHours: 7.6 },
  },
  stress: {
    key: 'stress',
    label: 'Stress',
    description: 'Fréquence cardiaque en hausse, nuit courte.',
    vitals: { heartRate: 101, spo2: 96, temperature: 37.3, sleepHours: 5.2 },
  },
  crise: {
    key: 'crise',
    label: 'Crise',
    description: 'Constantes critiques : alerte transmise au médecin de bord.',
    vitals: { heartRate: 128, spo2: 90, temperature: 38.6, sleepHours: 3.1 },
  },
}

export const SCENARIO_ORDER = ['normal', 'stress', 'crise']
