"""
Stock de médicaments de bord (§5, §6) : ressource commune à l'équipage,
consultée avant chaque prescription, décrémentée de façon atomique. Le
contenu médical (médicament, dosage, durée) est toujours figé (fichiers
protocoles/*.json et catalogue.json) : ni le modèle ni le colon ne le choisissent.

Économie du stock (les réserves doivent tenir toute la mission) :
- délai minimum entre deux délivrances du même médicament au même colon
  (`delai_h`) : un import critique répété ne redébite pas ;
- pour les prescriptions du chat : état orange/rouge requis, aucune alerte en
  cours (le protocole s'en charge), 2 par 24 h et par colon, et une réserve
  de stock (`CHAT_RESERVE`) gardée pour les urgences des protocoles.
"""
import os
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

import models
from catalogue import CATALOGUE

DELAI_PROTOCOLE_H = float(os.getenv("PRESCRIPTION_DELAI_H", "6"))
CHAT_MAX_24H = int(os.getenv("CHAT_MAX_PRESCRIPTIONS_24H", "2"))
CHAT_RESERVE = int(os.getenv("CHAT_RESERVE", "50"))


def _stock(db: Session, nom: str) -> int:
    return db.query(models.Medicament.quantite).filter(models.Medicament.nom == nom).scalar() or 0


def _recente(db: Session, colon_id: int, nom: str, delai_h: float) -> bool:
    depuis = datetime.utcnow() - timedelta(hours=delai_h)
    return (
        db.query(models.Prescription.id)
        .filter(models.Prescription.colon_id == colon_id, models.Prescription.medicament == nom,
                models.Prescription.timestamp >= depuis)
        .first()
        is not None
    )


def _consommer(db: Session, nom: str) -> int | None:
    """Décrément atomique (UPDATE conditionnel) ; renvoie le stock restant, ou None si vide."""
    modifie = (
        db.query(models.Medicament)
        .filter(models.Medicament.nom == nom, models.Medicament.quantite > 0)
        .update({models.Medicament.quantite: models.Medicament.quantite - 1}, synchronize_session=False)
    )
    return _stock(db, nom) if modifie else None


def _journaliser(db: Session, colon_id: int, nom: str, dosage: str, duree: str, origine: str) -> None:
    db.add(models.Prescription(colon_id=colon_id, medicament=nom, dosage=dosage, duree=duree, origine=origine))


def appliquer_prescription(db: Session, prescription: dict | None, colon_id: int) -> dict | None:
    """
    Prescription d'un protocole guidé. Médicament prévu, sinon alternative
    prédéfinie si le premier n'est pas à bord. Si le colon l'a déjà reçu
    récemment, on ne redébite pas : la carte indique « déjà prescrit ».
    """
    if prescription is None:
        return None

    choix = [(prescription["medicament"], prescription["dosage"], prescription["duree"], False)]
    alt = prescription.get("alternative")
    if alt:
        choix.append((alt["medicament"], alt["dosage"], alt["duree"], True))

    for nom, dosage, duree, alternative in choix:
        if _stock(db, nom) <= 0:
            continue
        if _recente(db, colon_id, nom, DELAI_PROTOCOLE_H):
            return {"medicament": nom, "dosage": dosage, "duree": duree, "stock_restant": _stock(db, nom),
                    "utilise_alternative": alternative, "deja_prescrit": True}
        restant = _consommer(db, nom)
        if restant is not None:
            _journaliser(db, colon_id, nom, dosage, duree, "protocole")
            return {"medicament": nom, "dosage": dosage, "duree": duree, "stock_restant": restant,
                    "utilise_alternative": alternative, "deja_prescrit": False}

    # Vu les stocks de départ (6 ans de mission), ce cas n'est pas censé
    # survenir pour le prototype (§5) ; on le rend visible plutôt que de planter.
    return {"medicament": prescription["medicament"], "dosage": prescription["dosage"], "duree": prescription["duree"],
            "stock_restant": 0, "utilise_alternative": False, "deja_prescrit": False}


def prescriptibles_par_chat(
    db: Session, colon_id: int, couleur: str, alerte_active: bool, detresse_terminee: bool = False
) -> tuple[list[dict], str | None]:
    """
    Médicaments que l'IA a le droit de prescrire MAINTENANT à ce colon, et, si
    aucun, la raison (pour que le modèle l'explique sans inventer). Ces règles
    ne dépendent pas du modèle : il ne peut pas les contourner.
    """
    if alerte_active:
        return [], "une alerte est en cours : le protocole guidé s'en occupe"
    # Constantes normales : un médicament n'est envisageable qu'après un protocole de
    # détresse psychologique terminé (le modèle-médecin juge alors s'il est justifié).
    if couleur not in ("orange", "rouge") and not detresse_terminee:
        return [], "les constantes ne justifient pas un médicament"
    depuis = datetime.utcnow() - timedelta(hours=24)
    deja = db.query(models.Prescription.id).filter(
        models.Prescription.colon_id == colon_id, models.Prescription.origine == "chat",
        models.Prescription.timestamp >= depuis).count()
    if deja >= CHAT_MAX_24H:
        return [], "le maximum de prescriptions sur 24 h est atteint"
    ok, raison = [], "aucun médicament du catalogue n'est disponible ou déjà reçu récemment"
    for entree in CATALOGUE.values():
        nom = entree["medicament"]
        if _stock(db, nom) <= CHAT_RESERVE:
            raison = "les stocks sont à préserver"
        elif _recente(db, colon_id, nom, entree["delai_min_h"]):
            raison = "un médicament du même type a déjà été délivré récemment"
        else:
            ok.append(entree)
    return ok, (None if ok else raison)


def prescrire_par_chat(
    db: Session, colon_id: int, med_id: str, couleur: str, alerte_active: bool, detresse_terminee: bool = False
) -> tuple[dict | None, str]:
    """Délivre un médicament du catalogue si les règles l'autorisent (re-vérifiées ici)."""
    autorises, raison = prescriptibles_par_chat(db, colon_id, couleur, alerte_active, detresse_terminee)
    entree = next((e for e in autorises if e["id"] == med_id), None)
    if entree is None:
        demande = CATALOGUE.get(med_id)
        if demande is None:
            return None, "ce médicament n'est pas dans le catalogue de prescription"
        if raison:
            return None, raison
        # D'autres médicaments restent permis : préciser pourquoi CELUI-CI ne l'est pas.
        if _stock(db, demande["medicament"]) <= CHAT_RESERVE:
            return None, "les stocks de ce médicament sont à préserver"
        return None, "ce médicament a déjà été délivré récemment (délai minimum non écoulé)"
    restant = _consommer(db, entree["medicament"])
    if restant is None:
        return None, "les stocks sont à préserver"
    _journaliser(db, colon_id, entree["medicament"], entree["dosage"], entree["duree"], "chat")
    return {"medicament": entree["medicament"], "dosage": entree["dosage"], "duree": entree["duree"], "stock_restant": restant}, ""
