# Reste à faire

État au 2026-09-23. Vérifié : 8 tests pytest (`backend/tests`) et un parcours navigateur headless (Chromium, mobile 390 px, avant retrait du mock : à rejouer) : connexion, état critique, protocole guidé, bandeau équipage, « Que faire ? », avancée des étapes, résolution automatique de l'alerte, page Données.

## Non vérifié faute d'environnement

- **Docker Compose** : le CLI Docker existe mais le démon n'est pas joignable depuis WSL (intégration Docker Desktop/WSL2 non activée) ; `docker-compose.yml` et les Dockerfile n'ont jamais été lancés. Le backend a tourné en venv Python + uvicorn, le front en build Vite servi en statique.
- **Ollama / modèle réel** : non installé ici. Seul le **mode dégradé** (`source: "regles"`) a été exercé. Le chemin `source: "ia"`, le choix 3B vs 7B et la cible < 10 s restent à tester sur le matériel du campus (`OLLAMA_MODEL` ; `OLLAMA_TIMEOUT=8` dans `docker-compose.yml`, à relever si le modèle est lent au premier appel).
- **Téléphone / tablette réels** et navigateurs autres que Chromium ; formulaire d'import et page Historique non parcourus dans le navigateur (l'API correspondante est testée).
- **Hors ligne total** : polices/CDN externes du front non auditées.

## Choix assumés

- Plus aucun mock côté front : l'accueil, les données et l'historique viennent tous de l'API. Pas de chat libre (hors périmètre CDC §2).
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
