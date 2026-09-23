import { formatNumber } from '../utils/format'

/**
 * Recommandations de démonstration.
 *
 * Garde-fous (voir CLAUDE.md) : jamais de diagnostic, jamais de médicament.
 * Le texte reste au registre du bien-être ("recommande", "propose") et
 * oriente vers le médecin de bord en cas de constantes critiques — il ne
 * qualifie jamais un état médical.
 *
 * `source: 'ia' | 'regles'` reflète le mode dégradé du cahier des charges
 * (§5 : bascule sur un moteur de règles si le modèle IA ne répond pas). Ici
 * c'est simulé ; le vrai champ viendra de l'API une fois le contrat écrit.
 */
export function generateRecommendations(scenarioKey, vitals) {
  const fc = formatNumber(vitals.heartRate)
  const sommeil = formatNumber(vitals.sleepHours, 1)
  const spo2 = formatNumber(vitals.spo2)

  if (scenarioKey === 'crise') {
    return [
      {
        id: 'crise-repos',
        category: 'repos',
        title: 'Marquer une pause immédiate',
        text: `Ta fréquence cardiaque (${fc} bpm) et ta SpO₂ (${spo2} %) sortent nettement des plages habituelles. Installe-toi au calme et arrête toute activité en cours.`,
        source: 'ia',
      },
      {
        id: 'crise-respiration',
        category: 'respiration',
        title: 'Exercice de respiration guidée',
        text: '4 secondes d’inspiration, 6 secondes d’expiration, pendant 3 minutes, pour accompagner le retour au calme.',
        source: 'ia',
      },
      {
        id: 'crise-medecin',
        category: 'social',
        title: 'Médecin de bord prévenu',
        text: `Une alerte a été transmise automatiquement au médecin de bord au vu de tes constantes (FC ${fc} bpm, sommeil ${sommeil} h). Reste joignable.`,
        source: 'regles',
      },
    ]
  }

  if (scenarioKey === 'stress') {
    return [
      {
        id: 'stress-respiration',
        category: 'respiration',
        title: 'Courte pause respiration',
        text: `Ta fréquence cardiaque (${fc} bpm) est un peu élevée. Une respiration lente de 5 minutes peut aider à la faire redescendre.`,
        source: 'ia',
      },
      {
        id: 'stress-repos',
        category: 'repos',
        title: 'Compenser la nuit courte',
        text: `Ta dernière nuit (${sommeil} h) est en dessous de ton habitude. Prévois un temps de repos supplémentaire dans la journée si possible.`,
        source: 'ia',
      },
      {
        id: 'stress-hydratation',
        category: 'hydratation',
        title: 'Penser à t’hydrater',
        text: 'Un verre d’eau maintenant, puis un rappel toutes les deux heures.',
        source: 'regles',
      },
    ]
  }

  return [
    {
      id: 'normal-social',
      category: 'social',
      title: 'Garder le lien avec l’équipage',
      text: `Tes constantes sont stables (FC ${fc} bpm, sommeil ${sommeil} h). C’est un bon moment pour un temps d’échange avec un·e collègue.`,
      source: 'ia',
    },
    {
      id: 'normal-exercice',
      category: 'exercice',
      title: 'Maintenir l’activité physique',
      text: '15 à 20 minutes d’exercice modéré aujourd’hui pour conserver ce bon équilibre.',
      source: 'ia',
    },
    {
      id: 'normal-hydratation',
      category: 'hydratation',
      title: 'Hydratation régulière',
      text: 'Continue de t’hydrater tout au long de la journée, notamment pendant les périodes d’activité.',
      source: 'regles',
    },
  ]
}

export const RECOMMENDATION_CATEGORIES = {
  repos: { label: 'Repos', icon: 'BedDouble' },
  hydratation: { label: 'Hydratation', icon: 'GlassWater' },
  exercice: { label: 'Exercice', icon: 'Dumbbell' },
  social: { label: 'Activité sociale', icon: 'Users' },
  respiration: { label: 'Respiration', icon: 'Wind' },
}
