# Reste à faire

État au 2026-09-23. Backend et front sont fonctionnels de bout en bout côté API ; les points ci-dessous n'ont pas pu être terminés ou vérifiés.

## Non vérifié faute d'environnement

- **Docker Compose** : le CLI Docker existe mais le démon n'est pas joignable depuis WSL (intégration Docker Desktop/WSL2 non activée) ; `docker-compose.yml` et les Dockerfile n'ont pas été lancés. Le backend a été validé en local (venv Python + uvicorn + pytest).
- **Ollama / modèle réel** : Ollama n'est pas installé ici. Seul le **mode dégradé** (`source: "regles"`) a été exercé. Le chemin `source: "ia"`, le choix 3B vs 7B et la cible < 10 s restent à tester sur le matériel du campus (`OLLAMA_MODEL`, `OLLAMA_TIMEOUT=8` dans `docker-compose.yml`).
- **Front dans un navigateur** : le build Vite passe, mais aucune vérification visuelle/manuelle (pas de navigateur). Le câblage de l'accueil (`Chat.jsx`), `CrewAlerts` et `ActiveProtocolCard` est à parcourir à la main, sur téléphone et ordinateur (critère §8).
- **Hors ligne total** : polices/CDN externes du front non auditées.

## Décisions produit laissées en l'état

- **Accueil = chat mocké** : le fil de discussion (`Chat.jsx`, `mocks/chatAssistant.js`) reste 100 % front, car le chat libre est hors périmètre du CDC (§2). L'accueil affiche désormais l'état réel, les recommandations et le protocole guidé issus de `GET /etat`. À trancher : garder ce hybride, ou retirer le fil mocké au profit de la page Accueil du CDC.
- **Import des constantes** uniquement sur la page « Données » (pas sur l'accueil).
- **Alertes équipage** : sondage toutes les 8 s (pas de WebSocket/SSE).

## Écarts / dette technique

- Seuils (`seuils.py`) : non validés médicalement. Ex. sommeil < 4 h donne « rouge » et déclenche le protocole épuisement ; pour la démo « orange », utiliser 4–6 h de sommeil.
- Le stock à zéro n'est pas géré (hors périmètre CDC §5) ; le décrément n'est pas atomique sous forte concurrence (SQLite, prototype).
- CORS ouvert (`*`) et comptes de démo (`erik1234`, `nyota1234`) : à restreindre hors démo. Les sessions n'expirent pas.
- Warnings `oxlint` préexistants dans le front (effets/refs) non traités ; `datetime.utcnow()` déprécié côté backend.
- Livrables jury (dossier PDF, présentation, intro en anglais) : hors code, non traités.
- Bonus : filtre par type dans l'historique (endpoint prêt, UI non vérifiée), montre ESP32 non faite.
- Outils de coordination ruflo (MCP `claude-flow`) : connexion en timeout durant la session, le travail a été fait directement sans swarm.
