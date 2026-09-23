# Huginn — Frontend web (React + JavaScript)

Assistant santé de bord du vaisseau *Yggdrasil*. 3 pages : accueil = chat
avec l'assistant, données corporelles, historique des recommandations.
Mascotte : **Foxy**, renard polaire animé.

Stack : Vite 7, React 19, React Router 7, Tailwind CSS 4, lucide-react.
JavaScript uniquement (`.jsx` / `.js`), pas de TypeScript.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build
```

Démo : `?nuit=1` force le quart de nuit, `?nuit=0` le coupe. L'intro Foxy se
joue une fois par session (vider `sessionStorage` pour la revoir).

## Garde-fous (non négociables)

Jamais de diagnostic, jamais de médicament — on oriente vers le médecin de
bord. Valable pour les textes, le mock du chat et les humeurs de Foxy.

## Arborescence

```
src/
  App.jsx                    routes, quart de nuit, intro
  index.css                  tokens Tailwind (ocean / mint / surfaces), variables jour/nuit
  pages/                     Chat.jsx · VitalData.jsx · History.jsx
  components/
    mascot/                  Foxy.jsx · foxy.css · useFoxyMood.js · FoxyAvatar.jsx · IntroSplash.jsx
    chat/                    WelcomeHero · MessageBubble · TypingIndicator · ChatInput · ChatBackground
    status/ vitals/ history/ ui/ nav/ dev/
  mocks/                     données de démo (à remplacer par l'API)
  utils/                     seuils, score de bien-être, formats, quart de nuit
```

## Foxy

11 humeurs : `happy`, `neutral`, `listening`, `thinking`, `worried`, `alert`,
`sad`, `sleepy`, `surprised`, `proud`, `cheer`. SVG inline + `@keyframes`
CSS, aucune dépendance.

```jsx
<Foxy mood="listening" size={220} />
<Foxy mood="neutral" size={32} crop="head" />   // sous ~40 px
```

`useFoxyMood(ctx)` choisit l'humeur : phase du chat (saisie → `listening`,
réponse → `thinking`) > réaction au message du colon (mots-clés, 6 s) >
humeur de fond selon les constantes. Une alerte critique ne peut jamais
être masquée.

Intégrations : intro animée, logo de la nav, écran d'accueil, bandeau
d'humeur du chat, avatars des bulles, indicateur de saisie, carte d'état
global (humeur selon vert/orange/rouge), en-tête de l'historique.

Toutes les animations s'arrêtent sous `prefers-reduced-motion`.

## Quart de nuit

De 23 h à 6 h, `<html>` reçoit la classe `dark` : surfaces et textes basculent
via des variables CSS, sur toutes les pages. Foxy dort, les amorces du chat
se réduisent.
