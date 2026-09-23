# Huginn — Frontend

Webapp React (Vite) du prototype Huginn : 3 pages (accueil = chat avec
l'assistant, données corporelles, historique), responsive, thème clair
bleu/vert. Voir [CLAUDE.md](../CLAUDE.md) à la racine pour les règles du
projet.

> ⚠️ **Écart assumé au cahier des charges** : la page d'accueil est un chat
> interactif avec l'assistant (façon Claude/ChatGPT), alors que le cahier
> des charges classait "chat avec l'IA" en V1 / hors périmètre du
> prototype. Décision produit assumée — à faire valider avec l'équipe/le
> jury si besoin, et à refléter dans le dossier technique.

## Démarrer

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build     # build de production dans dist/
npm run preview   # sert le build localement
npm run lint       # oxlint
```

## Structure

```
src/
  components/
    nav/        # Sidebar repliable (desktop), TopBar, MobileTopNav (mobile), AppLayout
    ui/         # primitives : Card, Icon (Lucide), StatusBadge, ScoreRing
    chat/       # bulles de message, indicateur "en train d'écrire", champ de saisie (page Accueil)
    status/     # carte état global, alerte médecin, recommandations (affichées sur la page Données)
    vitals/     # cartes constantes, graphique d'évolution (page Données)
    history/    # liste + filtre (page Historique)
    dev/        # ScenarioSwitcher — outil de démo uniquement, pas une fonctionnalité produit
  context/      # ScenarioContext (scénario normal/stress/crise courant)
  mocks/        # données simulées (colon, scénarios, séries de constantes, recommandations, historique, réponses du chat)
  utils/        # seuils, calcul du score de bien-être, formatage de dates
  pages/        # Chat, VitalData, History (routées dans App.jsx)
```

## Pages

- **Accueil (`/`, `pages/Chat.jsx`)** : chat avec Huginn. Message
  d'accueil générique, zone de saisie, réponses générées par
  `mocks/chatAssistant.js` (mock front-only à base de mots-clés). Fond
  dégradé bleu/vert animé (`.chat-bg` dans `index.css`), désactivé si
  l'utilisateur préfère moins d'animations.
- **Données (`/donnees`, `pages/VitalData.jsx`)** : état global (score +
  code couleur), alerte médecin si critique, constantes en temps réel,
  graphique d'évolution 24h/7j, et les recommandations de l'IA (sous
  forme de cartes, sous les constantes).
- **Historique (`/historique`, `pages/History.jsx`)** : recommandations
  passées, filtrables par catégorie.

## Données simulées

Tant que le simulateur de montre et le backend ne sont pas branchés,
les pages consomment `src/mocks/*`. Le sélecteur "Scénario démo"
(en haut de la page Données) permet de rejouer normal → stress →
crise pour la démo, sans dépendre du reste de l'équipe.

**À faire quand le backend sera prêt** :
- Remplacer les imports de `src/mocks/scenarios.js`, `recommendations.js`,
  `history.js` par des appels à l'API décrite dans
  `docs/contrat-interface.md`, en gardant les mêmes formes de données
  pour limiter les changements dans les composants.
- Remplacer `generateReply()` dans `mocks/chatAssistant.js` par un vrai
  appel au backend (qui passe par `backend/app/ai/recommender.py`, avec
  bascule sur le moteur de règles si Ollama ne répond pas).

## Navigation & thème

- **Navigation** : sidebar repliable + top bar à partir de 768px ; en
  dessous, pas de bottom bar — une nav du haut à 2 boutons icône
  contextuels (vers les deux autres pages) + logo cliquable vers
  l'accueil.
- **Icônes** : [lucide-react](https://lucide.dev), bundlées via npm —
  aucune police web, aucun CDN (contrainte hors ligne, voir
  CLAUDE.md).
- **Thème** : tokens Tailwind v4 définis dans `src/index.css`
  (`@theme`), palette bleu (`ocean-*`) / vert (`mint-*`) + couleurs
  sémantiques d'état (`status-good/warning/critical`) pour le code
  couleur vert/orange/rouge.
- **Dégradé animé** : utilisé uniquement en fond de la page Accueil/Chat
  (`.chat-bg`), pas sur les pages Données/Historique.
