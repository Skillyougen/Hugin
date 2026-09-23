# Contrat d'interface backend ↔ front

Référence pour le Bloc 4 (front). Base URL en dev : `http://localhost:8000`
(voir `backend/README.md` pour le lancement). Doc interactive auto-générée :
`http://localhost:8000/docs`.

Toutes les routes sauf `POST /auth/login` et `GET /health` exigent l'en-tête :

```
Authorization: Bearer <token>
```

Le `colon` est toujours déduit du token, jamais d'un paramètre envoyé par le
client — c'est ce qui garantit qu'un colon ne voit jamais les données d'un
autre (cahier des charges §5).

## ⚠️ Écart à trancher : la page Accueil est un chat, pas les cartes du CDC

Le cahier des charges (`docs/cahier-des-charges.md` §2 et §4) classe le
"chat libre avec l'assistant" hors périmètre du prototype, et décrit la page
Accueil comme une carte d'état global + des cartes de recommandations. Le
front actuel (`frontend/src/pages/Chat.jsx`) a déjà pivoté vers un chat façon
ChatGPT, avec un mock 100% front (`frontend/src/mocks/chatAssistant.js`).

Comme le cahier des charges prime sur le front en cas de contradiction, ce
backend n'expose **pas** d'endpoint de chat libre : `POST /mesures` +
`GET /etat` couvrent le flux indispensable (import → décision → carte
d'état + recommandations + protocole guidé si besoin). Si l'équipe confirme
le pivot vers un chat comme page d'accueil définitive, c'est une décision
produit qui reste à trancher avant jeudi soir et qui demandera un endpoint
dédié (`POST /chat` ou équivalent) — non fait ici pour ne pas improviser un
prompt système IA qui n'est pas dans le cahier des charges.

En attendant, `GET /etat` donne tout ce qu'il faut pour une page Accueil
conforme au CDC (état global, dernières constantes, recommandations,
protocole actif). `VitalData.jsx` et `History.jsx` sont déjà alignés avec
les pages 2 et 3 du CDC et peuvent se brancher sur `GET /mesures` et
`GET /recommandations` sans changement de structure de page.

## Authentification

### `POST /auth/login`

```json
// Requête
{ "identifiant": "erik", "mot_de_passe": "erik1234" }

// Réponse 200
{ "token": "xxxxx", "colon_id": 1, "nom": "Erik" }
```

`401` si identifiant/mot de passe incorrect. Comptes de démo créés par
`backend/app/seed.py` : `erik` / `erik1234` (colon du scénario), `nyota` /
`nyota1234` (reste de l'équipage). Pas d'auto-inscription (§2) : les comptes
sont pré-créés.

### `GET /colons/moi`

Profil du colon connecté : `{ "id": 1, "nom": "Erik" }`.

## Page 1 — Accueil

### `GET /etat`

État global du colon connecté (carte d'état, résumé des dernières
constantes, recommandations, protocole guidé actif s'il y en a un).

```json
{
  "colon_id": 1,
  "couleur": "rouge",            // "aucune_donnee" | "vert" | "orange" | "rouge"
  "score": 2,                    // -1 | 0 | 1 | 2 (assorti à couleur)
  "derniere_mesure": { "id": 5, "colon_id": 1, "frequence_cardiaque": 128,
                        "spo2": 90, "temperature": 38.6, "sommeil_heures": 3.1,
                        "symptomes": "un peu essoufflé depuis ce matin",
                        "timestamp": "2026-09-23T10:00:00" },
  "recommandations": [ { "id": 5, "texte": "...", "type": "respiration",
                          "etat_couleur": "rouge", "source": "ia",
                          "timestamp": "..." } ],
  "protocole_actif": {
    "alerte_id": 3,
    "protocole_id": "hypoxie",
    "titre": "Détresse respiratoire / hypoxie (SpO2 basse)",
    "etapes": ["Arrête toute activité...", "..."],
    "etape_courante": 0,
    "termine": false,
    "prescription": { "medicament": "Bronchodilatateur inhalé",
                       "dosage": "2 bouffées", "duree": "toutes les 4h pendant 24h",
                       "stock_restant": 499, "utilise_alternative": false }
  }
}
```

`couleur: "aucune_donnee"` tant que le colon n'a rien importé — c'est l'état
"pas de vert par défaut" du §4 : n'affiche ni carte d'état ni recommandation
dans ce cas, invite au premier import.

`protocole_actif` est `null` s'il n'y a pas d'alerte active en cours pour ce
colon. Ses `etapes` sont le contenu figé complet du protocole ; `etape_courante`
indexe la dernière étape validée (0 = aucune étape encore franchie).

### `POST /protocole/etape-suivante`

Fait avancer le colon connecté d'une étape dans son protocole actif. Même
forme de réponse que `protocole_actif` ci-dessus. `404` si aucun protocole
actif. Quand la dernière étape est atteinte, `termine` passe à `true` et
l'alerte associée se résout automatiquement côté serveur (pas d'action
supplémentaire à faire depuis le front).

### `GET /alertes`

Bandeau équipage : alertes actives (non résolues) de tous les colons, **sans
aucune donnée brute** de constantes.

```json
[ { "id": 3, "colon_id": 1, "colon_nom": "Erik",
    "motif": "État critique détecté — assistance requise",
    "timestamp": "...", "resolue": false } ]
```

### `GET /alertes/{alerte_id}/protocole`

Bouton "Que faire ?" : même forme que `protocole_actif`, en lecture seule
(l'appel n'avance pas l'étape — seul le colon concerné le fait via
`POST /protocole/etape-suivante`). `404` si l'alerte n'existe pas ou n'a pas
de protocole associé.

## Page 2 — Données corporelles

### `POST /mesures`

Import manuel d'une mesure pour le colon connecté.

```json
// Requête
{ "frequence_cardiaque": 72, "spo2": 98, "temperature": 36.8, "sommeil_heures": 7.5,
  "symptomes": "un peu essoufflé depuis ce matin" }
```

Plages plausibles validées côté serveur (`422` avec le détail du champ en
cause si une valeur est hors plage ou manquante — §5) :
fréquence cardiaque 20–250 bpm, SpO2 0–100 %, température 30–42 °C,
sommeil 0–24 h.

`symptomes` est optionnel (texte libre, 500 caractères max) : ce que le
colon décrit ressentir. **Il ne sert que de contexte pour la formulation de
la recommandation IA** (passé dans le prompt Ollama) — il n'entre jamais
dans le calcul de la couleur ni dans le choix du protocole de premiers
secours, qui restent basés uniquement sur les 4 constantes. Toujours
respecter le garde-fou du §5 : l'IA ne pose jamais de diagnostic à partir
de ce texte.

Réponse `200` : la mesure enregistrée (`id`, `colon_id`, les 4 valeurs,
`symptomes`, `timestamp`). Si l'état calculé est rouge, l'appel crée aussi
l'alerte et le protocole actif — relire `GET /etat` ensuite (ou l'appeler
juste après) pour les récupérer.

### `GET /mesures?range=24h|7j`

Historique des mesures du colon connecté sur la période demandée (24h par
défaut). Vide tant qu'aucun import n'a été fait (§4 : pas d'historique
pré-chargé).

## Page 3 — Historique des recommandations

### `GET /recommandations?type=repos|hydratation|exercice|social|respiration`

Historique des recommandations du colon connecté, plus récentes d'abord.
`type` est optionnel (filtre bonus du §4).

### `GET /historique-conversation`

Historique des échanges IA du colon connecté (texte libre décrit lors d'un
import de mesure + recommandation générée), plus récents d'abord.

```json
[ { "id": 5, "message_utilisateur": "un peu essoufflé depuis ce matin",
    "reponse_ia": "...", "timestamp": "2026-09-23T10:00:00" } ]
```

Ce n'est **pas** l'endpoint de chat libre écarté plus haut : ces entrées
sont créées automatiquement par `POST /mesures` (une par mesure importée),
pas par un envoi de message libre. Elles servent aussi de contexte propre
à chaque colon, réinjecté dans le prompt IA lors de sa prochaine mesure
(`ia.py::generer_recommandation`, paramètre `historique`) pour des réponses
plus personnalisées — jamais pour changer la couleur ou le protocole, qui
restent basés uniquement sur les seuils (même garde-fou que `symptomes`).

## Inventaire (support démo)

### `GET /medicaments`

`[ { "id": 1, "nom": "Bronchodilatateur inhalé", "quantite": 499 }, ... ]`
— utile pour afficher/vérifier le compteur de stock en démo.
