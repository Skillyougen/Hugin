# Huginn — conventions du projet

Prototype de 3 jours (workshop EPSI « Horizon 2080 »). Une IA 100 % locale analyse les constantes des colons d'un vaisseau et leur propose des recommandations de bien-être. En cas de risque, elle alerte le médecin de bord.

## Règles non négociables

- **Le contrat fait foi** : `docs/contrat-interface.md`. Le mettre à jour **avant** de changer un endpoint, un champ ou une table.
- **Hors ligne** : aucun CDN, aucune police web, aucune API externe au runtime. Toute dépendance front s'installe via npm et est bundlée.
- **Jamais de diagnostic ni de médicament** dans les textes générés ou codés en dur.
- **L'app ne plante jamais si Ollama est coupé** : tout appel à Ollama passe par `backend/app/ai/recommender.py`, qui bascule sur le moteur de règles.
- Hors périmètre : chat avec l'IA (V1), authentification, montre physique.


