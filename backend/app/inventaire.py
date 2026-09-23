"""
Décrément du stock de médicaments de bord (§5, §6) : ressource commune à
l'équipage, consultée avant chaque prescription. Le protocole ne choisit
jamais lui-même un médicament ou un dosage : il propose un couple
médicament/dosage/durée figé, et cette fonction se contente de vérifier la
disponibilité et de décrémenter — ou de basculer sur l'alternative prédéfinie
si le médicament prévu n'est pas dans l'inventaire.
"""
from sqlalchemy.orm import Session

import models


def appliquer_prescription(db: Session, prescription: dict | None) -> dict | None:
    if prescription is None:
        return None

    resultat = _consommer(db, prescription["medicament"], prescription["dosage"], prescription["duree"], alternative=False)
    if resultat is not None:
        return resultat

    alt = prescription.get("alternative")
    if alt:
        resultat = _consommer(db, alt["medicament"], alt["dosage"], alt["duree"], alternative=True)
        if resultat is not None:
            return resultat

    # Vu les stocks de départ (6 ans de mission), ce cas n'est pas censé
    # survenir pour le prototype (§5) ; on le rend visible plutôt que de
    # planter la requête.
    return {
        "medicament": prescription["medicament"],
        "dosage": prescription["dosage"],
        "duree": prescription["duree"],
        "stock_restant": 0,
        "utilise_alternative": False,
    }


def _consommer(db: Session, nom: str, dosage: str, duree: str, alternative: bool) -> dict | None:
    medicament = db.query(models.Medicament).filter(models.Medicament.nom == nom).first()
    if not medicament or medicament.quantite <= 0:
        return None

    medicament.quantite -= 1
    db.add(medicament)
    return {
        "medicament": nom,
        "dosage": dosage,
        "duree": duree,
        "stock_restant": medicament.quantite,
        "utilise_alternative": alternative,
    }
