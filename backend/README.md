# Huginn — Backend

FastAPI + SQLite, appel à Ollama en local avec fallback automatique
(mode dégradé) si le modèle ne répond pas.

## Démarrage avec Docker (recommandé)

```bash
# Depuis la racine du dépôt (le docker-compose.yml y vit)
docker compose up -d --build

# Télécharger le modèle dans le conteneur Ollama (une seule fois)
docker compose exec ollama ollama pull llama3.2:3b

# Vérifier que tout tourne
curl http://localhost:8000/health
```

L'API est sur `http://localhost:8000`, Ollama sur `http://localhost:11434`.
La base SQLite est persistée dans le volume Docker `backend_data` : les
données survivent à un `docker compose restart`.

Pour changer de modèle (ex. après le test 3B vs 7B) : modifie `OLLAMA_MODEL`
dans `docker-compose.yml`, relance `docker compose up -d`, puis
`docker compose exec ollama ollama pull <modèle>`.

Pour tout arrêter : `docker compose down` (ajoute `-v` pour aussi supprimer
les données et repartir de zéro).

## Démarrage manuel (sans Docker)

```bash
cd app
python -m venv venv
source venv/bin/activate   # Windows : venv\Scripts\activate
pip install -r ../requirements.txt

# Dans un autre terminal : Ollama doit tourner en local
ollama serve
ollama pull llama3.2:3b     # ou le modèle 7B retenu après le test de mardi

# Créer les comptes colons de démo + le stock de médicaments
python seed.py

# Lancer l'API
uvicorn main:app --reload --port 8000
```

L'API est alors sur `http://localhost:8000`. Doc interactive auto-générée :
`http://localhost:8000/docs`.

> Après avoir mis à jour ce backend (authentification, protocoles,
> médicaments), le schéma de la base a changé. Si tu avais déjà un
> `huginn.db` d'avant cette mise à jour, supprime-le (ou `docker compose
> down -v`) avant de relancer, sinon les nouvelles colonnes manqueront.

## Variables d'environnement (optionnelles)

- `OLLAMA_URL` (défaut `http://localhost:11434/api/generate`)
- `OLLAMA_MODEL` (défaut `llama3.2:3b`) — à changer selon le choix retenu mardi
- `OLLAMA_TIMEOUT` (défaut `8` secondes) — au-delà, bascule en mode dégradé

## Tester rapidement sans le simulateur

```bash
# Connexion (comptes de démo créés par seed.py)
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifiant":"erik","mot_de_passe":"erik1234"}'
# -> {"token": "...", "colon_id": 1, "nom": "Erik"}

TOKEN="<coller le token reçu>"

curl -X POST http://localhost:8000/mesures \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"frequence_cardiaque":72,"spo2":98,"temperature":36.8,"sommeil_heures":7.5}'

curl http://localhost:8000/etat -H "Authorization: Bearer $TOKEN"
```

Pour rejouer le scénario "stress" ou "crise", change simplement les valeurs
envoyées (ex. `frequence_cardiaque:115, sommeil_heures:3` pour du orange ;
`spo2:88` pour déclencher le protocole "hypoxie" en rouge + une alerte).

## Points d'intégration pour les autres blocs

Voir **`docs/contrat-interface.md`** à la racine du dépôt pour le détail de
chaque endpoint (payloads, réponses, codes d'erreur). Résumé :

- **Bloc 1 (données colon / import manuel)** : `POST /auth/login` puis
  `POST /mesures` — les deux seuls points d'entrée à cibler.
- **Bloc 2 (IA)** : le prompt système est dans `ia.py`, les protocoles de
  premiers secours figés dans `protocoles/*.json`. Le modèle et l'URL Ollama
  se règlent par variables d'environnement, pas besoin de toucher au reste du code.
- **Bloc 4 (front)** : `GET /etat` pour la page Accueil (inclut le protocole
  actif s'il y en a un), `GET /mesures?range=24h|7j` pour la page 2,
  `GET /recommandations` pour la page 3, `GET /alertes` pour le bandeau
  équipage, `GET /alertes/{id}/protocole` pour "Que faire ?".
  Toutes les routes sauf `/health` et `/auth/login` exigent
  `Authorization: Bearer <token>`. CORS est ouvert (`*`) pour le dev, à
  restreindre si besoin avant la démo.

## Mode dégradé

Si Ollama ne répond pas dans le délai (`OLLAMA_TIMEOUT`) ou renvoie une erreur,
`ia.py` bascule automatiquement sur `seuils.recommandations_regles()`. C'est
transparent pour le front : la réponse a juste `"source": "regles"` au lieu
de `"ia"`. Utile pour la démo du scénario "coupure du modèle IA en direct".

## Sécurité (résumé)

- Sessions de 12 h (`SESSION_HEURES`), 5 échecs de connexion par minute et par
  identifiant au maximum (429), mots de passe hachés en PBKDF2.
- CORS limité aux origines du front (`CORS_ORIGINS`, défaut : localhost).
- Sortie du modèle filtrée : toute posologie ou nom de médicament dans le texte
  généré le fait remplacer par le moteur de règles (le contenu médical ne vient
  que des protocoles figés).

## Tests

```bash
cd backend && pip install pytest httpx && python -m pytest tests -q
```
