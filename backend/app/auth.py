"""
Authentification simple par identifiant/mot de passe (cahier des charges §2,
§5 confidentialité). Pas de dépendance externe : hachage PBKDF2 du stdlib,
jetons opaques stockés en base (table sessions_auth). Suffisant pour un
prototype hors ligne, pas pensé pour tenir 6 ans de mission en prod.
"""
import hashlib
import os
import secrets
import time
from datetime import datetime, timedelta

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models

PBKDF2_ITERATIONS = 260_000
SESSION_DUREE = timedelta(hours=int(os.getenv("SESSION_HEURES", "12")))

# Anti-bruteforce en mémoire (prototype mono-processus) : au-delà de
# MAX_ECHECS échecs sur une fenêtre de FENETRE_S secondes, le login est
# refusé (429) pour cet identifiant.
MAX_ECHECS = 5
FENETRE_S = 60
_echecs: dict[str, list[float]] = {}


def login_bloque(identifiant: str) -> bool:
    maintenant = time.monotonic()
    recents = [t for t in _echecs.get(identifiant, []) if maintenant - t < FENETRE_S]
    _echecs[identifiant] = recents
    return len(recents) >= MAX_ECHECS


def noter_echec(identifiant: str) -> None:
    _echecs.setdefault(identifiant, []).append(time.monotonic())


def noter_succes(identifiant: str) -> None:
    _echecs.pop(identifiant, None)


def hash_password(mot_de_passe: str) -> str:
    sel = secrets.token_hex(16)
    empreinte = hashlib.pbkdf2_hmac("sha256", mot_de_passe.encode(), bytes.fromhex(sel), PBKDF2_ITERATIONS)
    return f"{sel}${empreinte.hex()}"


# Hash factice : vérifié quand l'identifiant n'existe pas, pour que le temps
# de réponse ne révèle pas quels comptes existent.
HASH_FACTICE = None


def hash_factice() -> str:
    global HASH_FACTICE
    if HASH_FACTICE is None:
        HASH_FACTICE = hash_password(secrets.token_hex(8))
    return HASH_FACTICE


def verifier_mot_de_passe(mot_de_passe: str, hache: str) -> bool:
    try:
        sel, attendu = hache.split("$")
    except ValueError:
        return False
    empreinte = hashlib.pbkdf2_hmac("sha256", mot_de_passe.encode(), bytes.fromhex(sel), PBKDF2_ITERATIONS)
    return secrets.compare_digest(empreinte.hex(), attendu)


def creer_session(db: Session, colon: "models.Colon") -> str:
    token = secrets.token_urlsafe(32)
    # Purge des sessions expirées (sinon la table grossit à chaque login).
    db.query(models.SessionAuth).filter(
        models.SessionAuth.timestamp < datetime.utcnow() - SESSION_DUREE
    ).delete()
    db.add(models.SessionAuth(token=token, colon_id=colon.id))
    db.commit()
    return token


def get_current_colon(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> "models.Colon":
    """
    Attend `Authorization: Bearer <token>`. Toute route protégée en dépend :
    c'est ce qui garantit qu'un colon ne peut jamais lire les données d'un
    autre (le colon vient toujours du token, jamais d'un paramètre client).
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentification requise")

    token = authorization.removeprefix("Bearer ").strip()
    session = db.query(models.SessionAuth).filter(models.SessionAuth.token == token).first()
    if not session or session.timestamp < datetime.utcnow() - SESSION_DUREE:
        raise HTTPException(status_code=401, detail="Session invalide ou expirée")

    colon = db.query(models.Colon).filter(models.Colon.id == session.colon_id).first()
    if not colon:
        raise HTTPException(status_code=401, detail="Session invalide ou expirée")
    return colon
