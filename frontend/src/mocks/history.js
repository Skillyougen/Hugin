// Historique des recommandations passées (page 3). Données figées pour la
// démo — à remplacer par l'historique réel stocké en base.
const HOURS = 60 * 60 * 1000
const now = Date.now()

const RAW_HISTORY = [
  { hoursAgo: 3, category: 'hydratation', title: 'Hydratation régulière', text: 'Rappel : un verre d’eau toutes les deux heures.', score: 88, level: 'good' },
  { hoursAgo: 9, category: 'exercice', title: 'Maintenir l’activité physique', text: '15 minutes d’exercice modéré pour conserver l’équilibre.', score: 91, level: 'good' },
  { hoursAgo: 15, category: 'social', title: 'Garder le lien avec l’équipage', text: 'Un temps d’échange avec un·e collègue recommandé.', score: 86, level: 'good' },
  { hoursAgo: 22, category: 'respiration', title: 'Courte pause respiration', text: 'FC un peu élevée (99 bpm) en fin de journée, respiration lente conseillée.', score: 63, level: 'warning' },
  { hoursAgo: 30, category: 'repos', title: 'Compenser la nuit courte', text: 'Nuit de 5,4 h, repos supplémentaire recommandé dans la journée.', score: 58, level: 'warning' },
  { hoursAgo: 46, category: 'hydratation', title: 'Penser à t’hydrater', text: 'Rappel d’hydratation pendant la période d’activité.', score: 74, level: 'warning' },
  { hoursAgo: 54, category: 'repos', title: 'Marquer une pause immédiate', text: 'FC à 124 bpm et SpO₂ à 91 % : arrêt d’activité recommandé.', score: 32, level: 'critical' },
  { hoursAgo: 54.2, category: 'social', title: 'Médecin de bord prévenu', text: 'Alerte transmise au vu des constantes critiques.', score: 32, level: 'critical' },
  { hoursAgo: 70, category: 'exercice', title: 'Maintenir l’activité physique', text: 'Constantes stables, activité modérée conseillée.', score: 90, level: 'good' },
  { hoursAgo: 96, category: 'respiration', title: 'Exercice de respiration guidée', text: 'Cycle 4/6 secondes pendant 3 minutes.', score: 67, level: 'warning' },
  { hoursAgo: 120, category: 'social', title: 'Garder le lien avec l’équipage', text: 'Constantes stables, bon moment pour un échange.', score: 89, level: 'good' },
  { hoursAgo: 144, category: 'hydratation', title: 'Hydratation régulière', text: 'Continuer l’hydratation tout au long de la journée.', score: 85, level: 'good' },
]

export const HISTORY = RAW_HISTORY.map((entry, index) => ({
  id: `hist-${index}`,
  date: new Date(now - entry.hoursAgo * HOURS),
  category: entry.category,
  title: entry.title,
  text: entry.text,
  wellbeing: { score: entry.score, level: entry.level },
}))
