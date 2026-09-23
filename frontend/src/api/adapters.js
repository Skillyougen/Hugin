// Adapte les formes de réponse du backend (docs/contrat-interface.md) vers
// les formes attendues par les composants UI existants (mocks/*).
import { RECOMMENDATION_CATEGORIES } from '../mocks/recommendations'

const COULEUR_TO_LEVEL = { vert: 'good', orange: 'warning', rouge: 'critical' }
const COULEUR_TO_SCORE = { vert: 100, orange: 55, rouge: 15 }
const LEVEL_LABEL = { good: 'État stable', warning: 'Vigilance recommandée', critical: 'Risque élevé' }

/** null tant qu'aucune mesure n'a été importée (§4 : pas de vert par défaut). */
export function wellbeingFromCouleur(couleur) {
  if (couleur === 'aucune_donnee' || !(couleur in COULEUR_TO_LEVEL)) return null
  const level = COULEUR_TO_LEVEL[couleur]
  return { score: COULEUR_TO_SCORE[couleur], level, label: LEVEL_LABEL[level] }
}

export function vitalsFromMesure(mesure) {
  if (!mesure) return null
  return {
    heartRate: mesure.frequence_cardiaque,
    spo2: mesure.spo2,
    temperature: mesure.temperature,
    sleepHours: mesure.sommeil_heures,
  }
}

export function chartPointsFromMesures(mesures, range) {
  const formatter =
    range === '7j'
      ? new Intl.DateTimeFormat('fr-FR', { weekday: 'short' })
      : new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return mesures.map((m) => ({
    label: formatter.format(new Date(m.timestamp)),
    heartRate: m.frequence_cardiaque,
    spo2: m.spo2,
    temperature: m.temperature,
  }))
}

export function adaptRecommandation(reco) {
  const category = RECOMMENDATION_CATEGORIES[reco.type] ? reco.type : 'social'
  return {
    id: reco.id,
    category,
    title: RECOMMENDATION_CATEGORIES[category].label,
    text: reco.texte,
    source: reco.source,
    date: reco.timestamp,
    wellbeing: wellbeingFromCouleur(reco.etat_couleur) ?? { score: 0, level: 'good' },
  }
}
