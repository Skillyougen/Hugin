# Huginn — Backend

FastAPI + SQLite, appel à Ollama en local avec fallback automatique
(mode dégradé) si le modèle ne répond pas.

## Démarrage avec Docker (recommandé)

```bash
# Depuis backend/ (le docker-compose.yml y vit désormais)
cd backend
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

# Créer le colon de démo "Erik"
python seed.py

# Lancer l'API
uvicorn main:app --reload --port 8000
```

L'API est alors sur `http://localhost:8000`. Doc interactive auto-générée :
`http://localhost:8000/docs`.

## Variables d'environnement (optionnelles)

- `OLLAMA_URL` (défaut `http://localhost:11434/api/generate`)
- `OLLAMA_MODEL` (défaut `llama3.2:3b`) — à changer selon le choix retenu mardi
- `OLLAMA_TIMEOUT` (défaut `8` secondes) — au-delà, bascule en mode dégradé

## Tester rapidement sans le simulateur

```bash
curl -X POST http://localhost:8000/mesures \
  -H "Content-Type: application/json" \
  -d '{"colon_id":1,"frequence_cardiaque":72,"spo2":98,"temperature":36.8,"sommeil_heures":7.5}'

curl http://localhost:8000/colons/1/etat
```

Pour simuler le scénario "stress" ou "crise", change simplement les valeurs
envoyées (ex. `frequence_cardiaque:115, sommeil_heures:3` pour du orange/rouge).

## Points d'intégration pour les autres blocs

- **Bloc 1 (simulateur)** : `POST /mesures` — c'est le seul point d'entrée à cibler.
- **Bloc 2 (IA)** : le prompt système est dans `ia.py`. Le modèle et l'URL Ollama
  se règlent par variables d'environnement, pas besoin de toucher au reste du code.
- **Bloc 4 (front)** : `GET /colons/{id}/etat` pour la page Accueil,
  `GET /colons/{id}/mesures?range=24h|7j` pour la page 2,
  `GET /colons/{id}/recommandations` pour la page 3.
  CORS est ouvert (`*`) pour le dev, à restreindre si besoin avant la démo.

## Mode dégradé

Si Ollama ne répond pas dans le délai (`OLLAMA_TIMEOUT`) ou renvoie une erreur,
`ia.py` bascule automatiquement sur `seuils.recommandations_regles()`. C'est
transparent pour le front : la réponse a juste `"source": "regles"` au lieu
de `"ia"`. Utile pour la démo du scénario "coupure du modèle IA en direct".
