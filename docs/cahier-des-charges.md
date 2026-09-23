# Cahier des charges — Huginn, assistant psychologique des colons

*Sep 21, 2026*

## 1. Contexte et problématique

Huginn est un assistant personnel qui veille sur la santé psychologique et physique des colons, à partir des constantes que chacun importe manuellement, à un instant donné, depuis sa montre connectée. Il répond au pilier **HumanTech & HealthTech Spatiales** du workshop Horizon 2080.

Dans un vaisseau interstellaire, l'équipage vit isolé pendant des mois, sans aucun contact possible avec la Terre — pas de communication en temps réel, pas de soutien médical ou psychologique extérieur, aucun secours envisageable en cas de crise. L'équipage n'a ni médecin ni psychologue à bord : chaque colon dépend de lui-même et du reste de l'équipage. Faute de tout recours humain, c'est à Huginn de prendre les décisions et de guider le colon, étape par étape, dans la réalisation des gestes nécessaires — y compris médicaux — quand sa situation l'exige. Fatigue, stress, troubles du sommeil et solitude peuvent dégrader la santé et la sécurité de toute la mission s'ils ne sont pas repérés tôt.

Le nom Huginn fait référence au corbeau de la pensée d'Odin, en écho à l'écusson Yggdrasil de la mission.

## 2. Objectifs et périmètre

L'objectif est de livrer d'ici jeudi soir une webapp fonctionnelle, démontrable en direct vendredi, où une IA locale analyse les constantes qu'un colon importe manuellement, décide de la conduite à tenir et le guide dans son exécution.

**Objectifs**

- Détecter tôt les signes de fatigue, de stress ou de mal-être à partir des constantes importées.
- Décider de la conduite à tenir et guider le colon pas à pas dans sa réalisation : repos, exercice, hydratation, activité sociale, exercice de respiration, et gestes médicaux de premiers secours si nécessaire.
- Prescrire, si le protocole l'exige, un médicament de l'inventaire de bord (nom, dosage et durée prédéfinis pour ce protocole), ou l'alternative prédéfinie si ce médicament n'est pas à bord.
- Alerter le reste de l'équipage quand la situation d'un colon dépasse ce que l'assistant peut gérer seul.
- Fonctionner sans aucune connexion avec la Terre, ni aucune aide extérieure.

**Dans le périmètre**

- Webapp responsive de 3 pages (accueil, données corporelles, historique).
- Compte par colon protégé par identifiant/mot de passe : c'est ce qui garantit que chacun ne voit que ses propres données.
- Import manuel des constantes par le colon, à un instant donné (formulaire de saisie, valeurs validées) : aucune simulation automatique de données, ni flux continu généré par l'app.
- Assistant IA local via Ollama, qui décide et guide le colon pas à pas à partir de protocoles de premiers secours écrits à l'avance (contenu figé, pas généré par le modèle), y compris la prescription d'un médicament quand le protocole le prévoit.
- Inventaire des médicaments de bord : chaque médicament a une quantité (le vaisseau part avec un stock pour toute la mission, 6 ans), décrémentée à chaque prescription pour un affichage crédible (« il reste X doses »). L'inventaire est consulté avant chaque prescription pour choisir entre le médicament prévu et son alternative si celui-ci n'est pas à bord ; vu le volume de départ, une pénurie n'est pas un scénario à gérer pour le prototype.

**Hors périmètre du prototype**

- Toute simulation automatique de constantes : les données viennent uniquement de la saisie manuelle du colon.
- Gestion avancée des comptes (mot de passe oublié, création de compte en libre-service) : les comptes colons sont pré-créés, pas d'auto-inscription.
- Chat libre avec l'assistant IA : évolution prévue pour une V1. Le guidage pas à pas du prototype reste sous forme de cartes/étapes prédéfinies, pas de conversation libre.
- Prescription libre : l'IA ne choisit qu'entre les médicaments et posologies déjà associés à un protocole figé — jamais un médicament ou un dosage qu'elle inventerait elle-même.
- Gestion des interactions médicamenteuses, allergies, contre-indications ou historique de traitement du colon : hors périmètre du prototype, à traiter en V1.
- Gestion de pénurie et réapprovisionnement : les quantités de départ représentent 6 ans de mission, largement au-delà de la durée du prototype — le compteur décrémente à chaque usage pour l'affichage, mais atteindre zéro n'est pas un scénario conçu ni testé.
- Gestes médicaux complexes (chirurgie, réanimation avancée) : le prototype se limite aux protocoles de premiers secours du kit médical de bord.
- Montre physique réelle connectée automatiquement (bonus si le matériel ESP32 est disponible ; en attendant, la saisie reste manuelle).
- Gestion multi-vaisseaux et synchronisation avec la Terre.

## 3. Utilisateurs et cas d'usage

Le prototype cible le colon ; le reste de l'équipage reçoit uniquement les alertes, faute de médecin de bord ou de tout autre secours.

| Utilisateur | Besoin | Ce qu'il voit |
| --- | --- | --- |
| Colon | Comprendre son état, savoir quoi faire | Ses constantes, son état global, ses recommandations, son historique |
| Reste de l'équipage | Être prévenu d'une situation à risque chez un autre colon, et savoir quoi faire | Les alertes émises par l'assistant (sans le détail des constantes) et, sur demande, la conduite à tenir |

**Cas d'usage principaux**

1. Le colon se connecte avec son identifiant et son mot de passe.
2. Le colon importe manuellement ses constantes (relevées sur sa montre) à un instant donné.
3. Le colon consulte son état global en ouvrant l'application.
4. L'assistant analyse les constantes importées, décide de la conduite à tenir et la lui propose.
5. Le colon consulte l'évolution de ses données corporelles importées.
6. Le colon consulte l'historique de ses recommandations.
7. L'assistant détecte une situation à risque, guide le colon pas à pas dans le geste de premiers secours à réaliser (avec prescription d'un médicament de l'inventaire de bord si le protocole le prévoit), et diffuse une alerte à tout l'équipage.
8. L'assistant propose l'alternative prédéfinie si le médicament prévu par le protocole n'est pas dans l'inventaire de bord.
9. Un membre de l'équipage, alerté, demande à l'assistant quoi faire : il consulte le même protocole guidé (lecture seule) que celui suivi par le colon concerné.
10. Une fois le protocole guidé arrivé à sa dernière étape, l'assistant réinitialise l'alerte automatiquement — plus besoin d'un médecin pour la lever.

## 4. Fonctionnalités de la webapp

La webapp est responsive (mobile, tablette, ordinateur) et comporte 3 pages accessibles depuis une barre de navigation.

### Page 1 — Accueil : état global et recommandations

- Carte d'état global : score de bien-être et code couleur (vert, orange, rouge), calculé à partir de la dernière saisie du colon.
- **Par défaut, sans aucune donnée :** pas d'état vert par défaut. L'app invite le colon à faire un premier import de constantes ; aucun état global ni recommandation ne s'affiche avant ça.
- Résumé des dernières constantes importées : fréquence cardiaque, SpO₂, température, sommeil de la nuit.
- Décisions et recommandations générées par l'IA à partir des constantes importées, affichées sous forme de cartes (repos, hydratation, exercice, activité sociale).
- En situation à risque : protocole guidé pas à pas (gestes de premiers secours à partir du kit médical de bord), affiché en cartes séquencées, avec la prescription de médicament associée si le protocole en prévoit une (nom, dosage, durée) et la quantité restante en inventaire (ex : « il reste 42 doses »).
- Indicateur visible quand une alerte a été diffusée à l'équipage.
- Pour tout colon connecté (en tant que membre de l'équipage) : bandeau des alertes actives d'autres colons, avec un bouton « Que faire ? » qui affiche le protocole guidé de la personne concernée (lecture seule, mêmes cartes que celles vues par le colon en crise). L'alerte est réinitialisée automatiquement par l'assistant dès que ce protocole atteint sa dernière étape.

### Page 2 — Données corporelles

- Formulaire de saisie manuelle : le colon relève ses constantes sur sa montre et les importe dans l'app, à l'instant t de son choix. Chaque champ est validé (type, unité, plage plausible) avant enregistrement ; en cas de valeur invalide ou de champ manquant, l'import est refusé avec un message clair.
- Dernières valeurs importées.
- Graphiques d'évolution sur 24 h et sur 7 jours, construits à partir des saisies successives. Aucun historique n'est pré-chargé au démarrage : les graphiques restent vides tant que le colon n'a pas importé plusieurs mesures.
- Mise en évidence des valeurs hors seuil.

### Page 3 — Historique des recommandations

- Liste des recommandations passées, classées par date. Vide au démarrage (aucun historique factice) : elle se remplit au fil des imports du colon.
- Pour chacune : l'état du colon à ce moment-là.
- Filtre par type de recommandation (bonus).

### Priorités

| Fonctionnalité | Priorité |
| --- | --- |
| Connexion par identifiant/mot de passe | Indispensable |
| Import manuel des constantes par le colon (avec validation) | Indispensable |
| Décisions et recommandations de l'IA à partir des constantes | Indispensable |
| État global sur l'accueil (avec état « aucune donnée ») | Indispensable |
| Constantes importées (page 2) | Indispensable |
| Protocole guidé pas à pas (premiers secours) | Indispensable |
| Prescription de médicament + stock associé | Indispensable |
| Alerte à l'équipage | Indispensable |
| Historique des recommandations | Important |
| Graphiques d'évolution | Important |
| Filtre dans l'historique | Bonus |
| Montre physique ESP32 | Bonus |
| Chat libre avec l'assistant | V1, hors prototype |
| Réapprovisionnement du stock | Hors prototype |

## 5. Exigences non fonctionnelles

Les exigences ci-dessous répondent directement aux critères « résilience » et « environnement isolé » de la grille du jury.

- **Hors ligne total :** tout tourne en local, modèle IA compris. Aucune dépendance à Internet, à une API externe, ou à une aide extérieure quelconque (aucun secours possible depuis la Terre).
- **Garde-fous de l'IA :** ton bienveillant. Faute de tout recours humain, l'assistant décide de la conduite à tenir et guide le colon pas à pas, y compris pour des gestes médicaux de premiers secours et pour une prescription de médicament. Le contenu des étapes et la liste médicament/dosage/durée sont **écrits à l'avance et figés** (fichiers du dépôt, voir section 6) : l'IA ne rédige et n'invente jamais elle-même une instruction médicale ou une posologie, elle choisit quel protocole (et quelle prescription associée) déclencher selon les constantes, les seuils, et la disponibilité en stock. En cas de constantes critiques, l'assistant déclenche en plus une alerte à l'équipage.
- **Confidentialité :** chaque colon a son propre compte (identifiant/mot de passe) ; ses données de santé et ses recommandations ne sont visibles que par lui, une fois connecté. En cas d'alerte, l'équipage est prévenu qu'un colon est en situation à risque, sans accès au détail de ses constantes.
- **Cycle de vie de l'alerte :** faute de médecin pour la lever, une alerte se résout d'elle-même — un membre de l'équipage qui demande « que faire ? » consulte le protocole guidé du colon concerné (lecture seule, même contenu figé), et l'assistant réinitialise l'alerte dès que ce protocole est terminé. Pas d'accusé de réception manuel à concevoir.
- **Validation des données :** toute constante importée est vérifiée (type, unité, plage plausible) avant d'être enregistrée ou transmise à l'IA ; une valeur hors plage ou un champ manquant bloque l'import plutôt que d'être silencieusement accepté.
- **Stock de médicaments :** chaque médicament a une quantité initiale représentant 6 ans de mission, décrémentée à chaque prescription (compteur affiché, pour un rendu crédible) ; le stock est partagé par tout l'équipage (ressource commune du vaisseau, pas par colon). Si le médicament prévu par le protocole n'est pas dans l'inventaire de bord, l'assistant propose l'alternative prédéfinie. Vu les quantités de départ, la gestion d'un stock à zéro n'est pas un cas à concevoir ni à tester pour le prototype.
- **Mode dégradé :** si le modèle IA ne répond pas, un moteur de règles simple prend le relais : il reste capable de proposer des actions de bien-être et de déclencher le bon protocole de premiers secours figé selon les seuils, sans dépendre du modèle.
- **Performance :** cible de génération d'une recommandation en moins de 10 secondes sur le matériel du campus (à valider selon le modèle choisi) ; un dépassement ponctuel est toléré, ce n'est pas un critère bloquant pour le prototype.

## 6. Architecture et technologies

L'ensemble tourne sur une seule machine, lancée avec Docker Compose.

Le colon se connecte, relève ses constantes sur sa montre et les importe manuellement dans la webapp, à l'instant t de son choix (aucune simulation, aucun flux automatique). Le backend valide et stocke chaque import, puis transmet aussitôt les constantes au modèle, qui décide de la conduite à tenir et sélectionne le guidage adapté au colon — protocole de premiers secours et, le cas échéant, prescription. Si le médicament prévu est dans l'inventaire, sa quantité est décrémentée ; sinon, l'alternative prédéfinie est utilisée.

![Schéma d'architecture : Colon (connexion, import manuel) et Webapp React vers Backend Python ou Go, relié à la Base de données (comptes, imports, décisions, alertes), à Ollama (modèle local), aux protocoles de premiers secours (fichiers statiques), au stock de médicaments (persisté en base) et à l'alerte équipage](images/architecture.svg)

| Couche | Technologie | Rôle |
| --- | --- | --- |
| Front | React.js | Webapp responsive, 3 pages, connexion, formulaire d'import manuel |
| Back | Python ou Go | API, authentification, stockage, liaison avec l'IA, alertes |
| Orchestrateur IA | Ollama | Exécute le modèle de langage en local, décide et sélectionne le protocole (et la prescription) à guider |
| Base de données | SQLite ou PostgreSQL | Comptes colons, imports, décisions, alertes, **stock de médicaments (quantités)** |
| Protocoles de premiers secours | Fichiers statiques du dépôt (JSON/Markdown) | Contenu médical figé, écrit à l'avance, versionné avec le code — étapes **et** couple médicament/dosage/durée associé, pas de stockage dynamique |
| Données colon | Formulaire d'import manuel | Le colon saisit ses constantes à un instant t |

**Choix à trancher immédiatement (en retard sur le planning initial)**

- [ ] Python ou Go pour le backend.
- [ ] Modèle Ollama : tester un modèle de 3B et un de 7B sur les machines du campus, garder le plus rapide qui reste pertinent.
- [ ] SQLite ou PostgreSQL.
- [ ] Seuils et unités des constantes (vert/orange/rouge) : à définir après recherche (valeurs médicales de référence à trouver).

## 7. Outils et organisation

L'équipe de 5 se répartit par blocs fonctionnels, chacun avec un responsable unique.

| Outil | Usage |
| --- | --- |
| GitHub | Dépôt de code, une branche par bloc, fusion quotidienne |
| VS Code | Développement |
| Notion | Kanban des tâches, cahier des charges, notes de réunion |

| Bloc | Contenu | Responsable |
| --- | --- | --- |
| 1. Données colon | Formulaire d'import manuel (avec validation), seuils d'alerte | À définir |
| 2. Assistant IA | Ollama, prompt système, garde-fous, mode dégradé, **rédaction des protocoles de premiers secours et des prescriptions figées** | À définir |
| 3. Backend et base | API, authentification, stockage, liaison IA, alertes, **stock de médicaments (lecture/décrément atomique)**, intégration | À définir |
| 4. Interface | Les 3 pages React, responsive, écran de connexion | À définir |
| 5. Pilotage et livrables | Kanban, dossier PDF, présentation, scénario de démo | À définir |

**Planning (on est mercredi, délais tendus — le plan a été resserré car les données ne peuvent plus venir d'un flux temps réel simulé, tout repose sur l'import manuel) :**

| Jour | Objectif de fin de journée |
| --- | --- |
| Mercredi (aujourd'hui) | Chemin critique de bout en bout, même imparfait : connexion, import manuel d'une mesure, réponse de l'IA (décision + protocole figé sélectionné), alerte à l'équipage. Le reste (graphiques, historique, filtre) attend. |
| Jeudi | Chemin critique fiabilisé et rejoué plusieurs fois, mode dégradé testé, historique et graphiques ajoutés si le temps le permet, livrables déposés le soir |
| Vendredi | Soutenance : 5 min de présentation et 5 min de questions |

## 8. Livrables, démo et critères de réussite

Les trois livrables sont déposés jeudi soir dans le dossier `Workshop2026-B3-G<n>`.

> **À inclure dans le dossier technique et la présentation :** Huginn est un prototype fictif pour un exercice de workshop. Le contenu médical (protocoles, prescriptions, inventaire) est illustratif, écrit pour la démo, et ne constitue ni un dispositif médical ni un avis médical réel.

| Livrable | Nom du fichier |
| --- | --- |
| Dossier technique | `Workshop2026-B3-G<n>-Dossier.pdf` |
| Présentation | `Workshop2026-B3-G<n>-Pres.pptx` |
| Code | `Workshop2026-B3-G<n>-Code.zip` ou lien GitHub |

**Scénario de démo (environ 1 minute)**

1. Erik, colon, se connecte avec son identifiant et son mot de passe : état « aucune donnée », l'app l'invite à importer une première mesure.
2. Erik importe manuellement des constantes normales. L'état passe au vert.
3. Erik importe manuellement de nouvelles constantes : fréquence cardiaque en hausse, nuit courte. L'état passe à l'orange.
4. L'assistant génère des recommandations adaptées : exercice de respiration, repos, rappel d'hydratation.
5. Erik importe manuellement des constantes de crise : l'état passe au rouge, l'assistant sélectionne et affiche le protocole de premiers secours figé correspondant (avec la prescription associée, présente dans l'inventaire), guide Erik pas à pas, et une alerte est diffusée à l'équipage.
6. Un autre colon connecté voit l'alerte, clique sur « Que faire ? » et consulte le même protocole. Une fois le protocole terminé, l'assistant réinitialise l'alerte.
7. On coupe le modèle IA en direct : le mode dégradé continue de fonctionner — recommandations de bien-être et sélection du bon protocole figé — à partir des mêmes constantes importées.

**Critères de réussite**

- Le scénario de démo tourne sans Internet, du début à la fin.
- Les recommandations de l'IA citent au moins une constante du colon.
- Pour chacun des 3 scénarios de démo (normal, stress, crise), l'assistant sélectionne le protocole de premiers secours (et la prescription associée) attendu — vérifié à l'avance, pas laissé au hasard le jour J.
- Le compteur de stock affiché se décrémente correctement après la prescription du scénario crise.
- Le parcours « médicament absent de l'inventaire → alternative prédéfinie » est testé au moins une fois avant la démo (même s'il n'est pas joué devant le jury) — au moins un protocole doit volontairement référencer un médicament absent de l'inventaire pour que ce cas soit démontrable.
- L'alerte se réinitialise automatiquement une fois que le protocole guidé consulté par l'équipage est terminé.
- Un colon ne voit jamais les données d'un autre colon.
- Les 3 pages sont utilisables sur téléphone et sur ordinateur.
- L'introduction de chaque membre est faite en anglais.
