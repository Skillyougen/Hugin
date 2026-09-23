"""
Authentification simple par identifiant/mot de passe (cahier des charges §2,
§5 confidentialité). Pas de dépendance externe : hachage PBKDF2 du stdlib,
jetons opaques stockés en base (table sessions_auth). Suffisant pour un
prototype hors ligne, pas pensé pour tenir 6 ans de mission en prod.
"""
import hashlib
import os
import secrets

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models

PBKDF2_ITERATIONS = 260_000


def hash_password(mot_de_passe: str) -> str:
    sel = secrets.token_hex(16)
    empreinte = hashlib.pbkdf2_hmac("sha256", mot_de_passe.encode(), bytes.fromhex(sel), PBKDF2_ITERATIONS)
    return f"{sel}${empreinte.hex()}"


def verifier_mot_de_passe(mot_de_passe: str, hache: str) -> bool:
    try:
        sel, attendu = hache.split("$")
    except ValueError:
        return False
    empreinte = hashlib.pbkdf2_hmac("sha256", mot_de_passe.encode(), bytes.fromhex(sel), PBKDF2_ITERATIONS)
    return secrets.compare_digest(empreinte.hex(), attendu)


def creer_session(db: Session, colon: "models.Colon") -> str:
    token = secrets.token_urlsafe(32)
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
    if not session:
        raise HTTPException(status_code=401, detail="Session invalide ou expirée")

    colon = db.query(models.Colon).filter(models.Colon.id == session.colon_id).first()
    if not colon:
        raise HTTPException(status_code=401, detail="Session invalide ou expirée")
    return colon
