# Huginn — assistant de santé des colons

Prototype de webapp du workshop Horizon 2080 (pilier HumanTech & HealthTech
spatiales) : un colon importe ses constantes à la main, une IA locale (Ollama)
décide de la conduite à tenir et le guide pas à pas, l'équipage est alerté en
cas de situation critique. Tout tourne hors ligne.

> Huginn est un prototype fictif pour un exercice de workshop. Le contenu
> médical (protocoles, prescriptions, inventaire) est illustratif, écrit pour
> la démonstration ; il ne constitue ni un dispositif médical ni un avis médical.

## Lancer l'application

```bash
docker compose up -d --build
docker compose exec ollama ollama pull llama3.2:3b   # une seule fois
```

- Webapp : http://localhost (comptes de démo : `erik` / `erik1234`, `nyota` / `nyota1234`)
- API : http://localhost:8000 (documentation interactive sur `/docs`)

Sans Ollama, l'application fonctionne quand même : un moteur de règles prend le
relais (mode dégradé).

Lancement sans Docker : voir `backend/README.md` et `frontend/README.md`.

## Structure

| Dossier | Contenu |
| --- | --- |
| `backend/` | API FastAPI + SQLite, protocoles figés (`app/protocoles/*.json`), tests |
| `frontend/` | Webapp React (3 pages : accueil, données, historique) |
| `docs/` | Cahier des charges, contrat d'interface, reste à faire |
| `docs/livrables/` | Dossier technique (PDF) et présentation (PPTX) |

## Tests

```bash
cd backend && pip install -r requirements.txt pytest httpx && python -m pytest tests -q
```
