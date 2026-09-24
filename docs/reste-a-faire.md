# Reste à faire

État au 2026-09-23. Vérifié : 9 tests pytest (`backend/tests`) et un parcours navigateur headless (Chromium, mobile 390 px et desktop 1280 px) sur le front sans mock : connexion, formulaire d'import, état orange puis rouge, plusieurs cartes de recommandations, protocole guidé, bandeau équipage, « Que faire ? », avancée des étapes, résolution automatique de l'alerte, historique et filtre.

## Non vérifié faute d'environnement

- **Docker Compose** : le CLI Docker existe mais le démon n'est pas joignable depuis WSL (intégration Docker Desktop/WSL2 non activée) ; `docker-compose.yml` et les Dockerfile n'ont jamais été lancés. Le backend a tourné en venv Python + uvicorn, le front en build Vite servi en statique.
- **Ollama / modèle réel** : sur la VM de test (CPU faible, Docker Desktop), `llama3.2:3b` s'installe et répond, mais très lentement (chargement 176 s, 1,6 token/s), donc au-delà des 30 s d'`OLLAMA_TIMEOUT` : l'application bascule alors en mode dégradé (« moteur de secours »). Choix assumé : on garde le 3B, prévu pour le matériel du campus. À valider là-bas : le temps de réponse (cible < 10 s, sinon essayer `llama3.2:1b` ou donner plus de CPU/RAM à Docker) et la qualité des textes. Le préchauffage au démarrage (`OLLAMA_WARMUP`) évite de payer le chargement au premier import ; l'attendre quelques minutes après `docker compose up` avant la démo.
- **Téléphone / tablette réels** et navigateurs autres que Chromium (seul un Chromium headless a été utilisé).
- **Hors ligne total** : polices/CDN externes du front non auditées.

## Choix assumés

- Plus aucun mock côté front. Le chat libre (c'est l'Accueil, historique dans l'onglet « Conversations » de la page Historique) est branché sur l'IA locale : c'est un ajout au-delà du CDC §2, à assumer devant le jury. Il reste soumis aux garde-fous (pas de diagnostic ni de médicament) mais un texte libre est plus difficile à cadrer que des cartes ; en mode secours il répond par un message fixe.
- L'IA est psychologue et médecin de bord : dans le chat elle peut prescrire (catalogue figé, posologie écrite par le serveur), avec des règles d'économie du stock appliquées côté serveur (état orange/rouge, délais, 2 par 24 h, réserve de 50 doses). Noms de médicaments grand public (Ventoline, Propranolol, Atarax, Doliprane) et posologies illustratifs, sans valeur médicale. Seuils et catalogue illustratifs, à régler selon les stocks réels. Pas de prescription libre : le modèle ne choisit qu'un identifiant. Détresse psychologique : protocole figé + alerte équipage (motif générique), déclenchés par un filet de mots-clés serveur (propos graves seulement, expressions courantes et négations exclues) ou par le jugement du modèle (1 par 12 h). Objectif : aucun faux positif, donc un propos ambigu n'alerte jamais sans modèle (risque inverse : une vraie crise en langage détourné peut passer si le modèle est coupé). Le jugement du modèle (vraie détresse ou confort) n'a pas été testé avec un vrai Ollama.
- Import des constantes uniquement sur la page « Données ».
- Alertes équipage : sondage toutes les 8 s (pas de WebSocket/SSE).
- Contenu médical illustratif (avertissement dans le README, le dossier technique et la présentation) : l'objectif est une démo fonctionnelle, pas des procédures validées.

## Sécurité : limites connues du prototype

- Comptes de démo (`erik1234`, `nyota1234`) et tokens en `localStorage` : à changer/durcir hors démo. Pas de HTTPS (réseau local du vaisseau).
- Anti-bruteforce en mémoire (perdu au redémarrage, non partagé entre processus).
- Le conteneur backend tourne en root ; pas de rotation des jetons.
- `ruvector.db` (artefact ruflo) est suivi par git alors que `*.db` est ignoré : à retirer de l'index si non voulu.

## Dette / bonus

- Stock à zéro non géré (hors périmètre CDC §5). Le décrément est atomique (UPDATE conditionnel).
- Warnings `oxlint` préexistants dans le front ; `datetime.utcnow()` déprécié côté backend.
- Livrables : dossier technique (PDF) et présentation (PPTX) générés en français dans `docs/livrables/` ; à renommer `Workshop2026-B3-G<n>-…` avec le numéro de groupe, et à relire/compléter (noms des membres, captures d'écran). Montre ESP32 : non faite.
- Coordination ruflo (MCP `claude-flow`) : timeout à la connexion, travail fait sans swarm.
