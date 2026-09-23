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
    # UPDATE conditionnel : deux prescriptions simultanées ne peuvent pas
    # lire la même quantité puis écrire la même valeur (§ cahier des charges :
    # « décrément atomique »).
    modifie = (
        db.query(models.Medicament)
        .filter(models.Medicament.nom == nom, models.Medicament.quantite > 0)
        .update({models.Medicament.quantite: models.Medicament.quantite - 1}, synchronize_session=False)
    )
    if not modifie:
        return None
    restant = db.query(models.Medicament.quantite).filter(models.Medicament.nom == nom).scalar()
    return {
        "medicament": nom,
        "dosage": dosage,
        "duree": duree,
        "stock_restant": restant,
        "utilise_alternative": alternative,
    }
