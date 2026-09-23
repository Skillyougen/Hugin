"""
Données de démo : les comptes colons du scénario (§8) et le stock initial
de médicaments de bord (§5 : quantités représentant 6 ans de mission).

Comptes colons pré-créés (§2 : pas d'auto-inscription) :
  - identifiant "erik"  / mot de passe "erik1234"   (colon du scénario de démo)
  - identifiant "nyota" / mot de passe "nyota1234"  (reste de l'équipage)
"""
from database import SessionLocal, engine, Base
import models
from auth import hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()

COLONS = [
    {"nom": "Erik", "identifiant": "erik", "mot_de_passe": "erik1234"},
    {"nom": "Nyota", "identifiant": "nyota", "mot_de_passe": "nyota1234"},
]

for c in COLONS:
    existe = db.query(models.Colon).filter(models.Colon.identifiant == c["identifiant"]).first()
    if not existe:
        colon = models.Colon(
            nom=c["nom"],
            identifiant=c["identifiant"],
            mot_de_passe_hash=hash_password(c["mot_de_passe"]),
        )
        db.add(colon)
        db.commit()
        db.refresh(colon)
        print(f"Colon créé : id={colon.id}, identifiant={colon.identifiant}")
    else:
        print(f"Colon déjà présent : id={existe.id}, identifiant={existe.identifiant}")

# Stock de bord. "Vasopresseur d'urgence" est volontairement absent de
# l'inventaire : le protocole hyperthermie le prévoit en premier choix, ce
# qui force le repli sur son alternative prédéfinie (antipyrétique) — c'est
# le cas exigé par le cahier des charges §8 pour démontrer ce parcours.
MEDICAMENTS = [
    ("Bronchodilatateur inhalé", 500),
    ("Oxygène médical (masque)", 200),
    ("Bêta-bloquant (propranolol)", 500),
    ("Anxiolytique léger", 500),
    ("Antipyrétique (paracétamol)", 500),
]

for nom, quantite in MEDICAMENTS:
    existe = db.query(models.Medicament).filter(models.Medicament.nom == nom).first()
    if not existe:
        db.add(models.Medicament(nom=nom, quantite=quantite))
        print(f"Médicament ajouté : {nom} (x{quantite})")
    else:
        print(f"Médicament déjà présent : {nom} (x{existe.quantite})")

db.commit()
db.close()
