/**
 * Assistant de chat — logique 100 % front, en attendant le backend.
 *
 * IMPORTANT : dès que `docs/contrat-interface.md` décrit l'endpoint de chat,
 * `generateReply` doit être remplacé par un vrai appel réseau vers le
 * backend (qui lui-même passe par backend/app/ai/recommender.py, avec
 * bascule automatique sur le moteur de règles si Ollama ne répond pas).
 * Ici on simule seulement ce mode dégradé par des réponses à base de
 * mots-clés — le but est d'avoir une démo qui fonctionne de bout en bout,
 * pas de préfigurer le vrai prompt système.
 *
 * Garde-fous non négociables (CLAUDE.md), à respecter même dans le mock :
 * jamais de diagnostic, jamais de médicament. On reste sur de l'écoute et
 * des pistes de bien-être, et on oriente vers le médecin de bord dès qu'un
 * mot-clé d'alerte apparaît.
 */

const RULES = [
  {
    keywords: ['bonjour', 'salut', 'hello', 'coucou'],
    replies: [
      'Bonjour ! Comment te sens-tu aujourd’hui ?',
      'Salut, content de te lire. Comment se passe ta journée à bord ?',
    ],
  },
  {
    keywords: ['fatigue', 'fatigué', 'fatiguée', 'épuisé', 'épuisée', 'crevé'],
    replies: [
      'Ça fait du bien de le dire. Si tu peux, accorde-toi une vraie pause dans les prochaines heures — même courte.',
      'La fatigue s’accumule vite en mission longue. Tu veux qu’on regarde ensemble ton sommeil sur la page Données ?',
    ],
  },
  {
    keywords: ['stress', 'stressé', 'stressée', 'anxieux', 'anxieuse', 'angoisse'],
    replies: [
      'C’est normal d’avoir des moments de tension ici. Une respiration lente de quelques minutes peut aider à redescendre.',
      'Merci de partager ça. Veux-tu un petit exercice de respiration guidée ?',
    ],
  },
  {
    keywords: ['dormir', 'sommeil', 'insomnie', 'nuit'],
    replies: [
      'Le sommeil est précieux en vaisseau. Essaie de garder des horaires réguliers, même quand le programme est chargé.',
      'Tu peux suivre l’évolution de tes nuits sur la page Données, ça aide à repérer les tendances.',
    ],
  },
  {
    keywords: ['seul', 'seule', 'isolé', 'isolée', 'manque', 'triste'],
    replies: [
      'L’isolement pèse, c’est compréhensible sur une mission aussi longue. Un temps d’échange avec un membre de l’équipage peut vraiment aider.',
      'Merci de me le dire. Tu n’es pas seul·e à bord — pense à en parler aussi à quelqu’un de l’équipage.',
    ],
  },
  {
    keywords: ['mal', 'douleur', 'souffre', 'urgence', 'grave'],
    replies: [
      'Je ne peux pas poser de diagnostic, mais ce que tu décris mérite l’avis du médecin de bord. Je te recommande de le contacter.',
    ],
  },
  {
    keywords: ['merci'],
    replies: ['Avec plaisir. Je reste disponible si tu veux en reparler.'],
  },
]

const FALLBACK_REPLIES = [
  'Je note. Tu veux m’en dire un peu plus ?',
  'Merci de partager ça avec moi. Comment te sens-tu physiquement en ce moment ?',
  'D’accord. N’hésite pas à consulter tes constantes sur la page Données si tu veux un état des lieux.',
]

function pick(list) {
  return list[Math.floor(Math.random() * list.length)]
}

export function generateReply(userText) {
  const text = userText.toLowerCase()
  const rule = RULES.find((r) => r.keywords.some((keyword) => text.includes(keyword)))
  return pick(rule ? rule.replies : FALLBACK_REPLIES)
}

export const WELCOME_MESSAGE = 'Bonjour, je suis Huginn. Comment te sens-tu aujourd’hui ?'
