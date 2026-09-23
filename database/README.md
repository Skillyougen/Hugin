# Base de données - Projet Huginn

## Ce que contiennent ces fichiers

- `schema.sql` : définit les 4 tables (colons, mesures, recommandations, alertes)
- `init_db.py` : crée la base `huginn.db` et la remplit avec des données de test
- `README.md` : ce fichier

## Comment lancer (étape par étape, pour débutant)

### 1. Vérifier que Python est installé
Ouvre un terminal (Invite de commandes sur Windows, Terminal sur Mac/Linux) et tape :
```
python3 --version
```
Si tu vois un numéro de version, c'est bon. Si erreur, installe Python depuis https://www.python.org/downloads/ (coche bien "Add Python to PATH" pendant l'installation sur Windows).

### 2. Placer les fichiers
Mets `schema.sql` et `init_db.py` dans le même dossier (par exemple `database/` dans ton projet Git).

### 3. Se placer dans ce dossier via le terminal
```
cd chemin/vers/database
```

### 4. Lancer le script
```
python3 init_db.py
```

Tu devrais voir s'afficher :
```
Tables créées avec succès.
Colon de test créé : Erik (id=1)
Données de test insérées (scénarios: normal, stress, crise).

--- Vérification ---
Colons : 1
Mesures : 7
Recommandations : 2
Alertes : 1

Terminé. La base 'huginn.db' est prête dans ce dossier.
```

Un fichier `huginn.db` apparaît dans le dossier : c'est ta base de données, toute prête.

### 5. (Optionnel) Visualiser la base
Installe **DB Browser for SQLite** : https://sqlitebrowser.org/dl/
Ouvre `huginn.db` avec cet outil pour voir les tables et données sous forme de tableau.

## Comment le backend va se connecter à cette base

En Python, n'importe qui dans l'équipe peut se connecter avec :
```python
import sqlite3
conn = sqlite3.connect("huginn.db")
cursor = conn.cursor()
cursor.execute("SELECT * FROM mesures WHERE colon_id = ?", (1,))
resultats = cursor.fetchall()
```

En Go, il faudra le driver `modernc.org/sqlite` ou `github.com/mattn/go-sqlite3`.

## Prochaines étapes pour toi

1. Relance `python3 init_db.py` à chaque fois que tu modifies `schema.sql` (ça recrée la base à zéro)
2. Montre ce dossier au responsable backend pour qu'il/elle sache comment lire/écrire dans la base
3. Si le schéma doit changer (nouvelle colonne, nouvelle table), modifie `schema.sql` puis relance le script
4. Écris quelques requêtes SQL de test pour préparer ce que les pages (accueil, données corporelles, historique) vont demander — dis-moi si tu veux de l'aide dessus
