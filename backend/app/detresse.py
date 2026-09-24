"""
Détresse psychologique : protocole guidé figé (protocoles/detresse_psychologique.json)
et alerte à l'équipage (motif générique : rien de ce qui a été dit dans le chat n'est transmis).

Objectif : aucun faux positif (une alerte à l'équipage ne doit pas être déclenchée à la légère).
- propos GRAVES, non niés et hors expression courante (« envie de me faire du mal », « je veux
  en finir » en fin de phrase, « envie de mourir » mais pas « mourir de rire ») : le filet de
  mots-clés côté serveur alerte directement, sans attendre le modèle ;
- propos AMBIGUS (« crise de panique », « je n'en peux plus » seul, propos grave nié) : seul le
  modèle-médecin peut déclencher (ligne « DETRESSE: OUI »). SANS modèle, pas d'alerte : mieux
  vaut ne pas alerter que d'alerter à tort ;
- le jugement du modèle sur le contexte, sans mot-clé, limité à un déclenchement par 12 h et par
  colon pour ne pas inonder l'équipage.
« Je n'en peux plus de ce repas » n'est pas un mot-clé (complément) : le modèle en juge.
"""
import re
import unicodedata
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

import models

PROTOCOLE_ID = "detresse_psychologique"
MOTIF = "Un colon a besoin d'un soutien immédiat"
DELAI_H = 12

_GRAVE = re.compile(
    r"suicid|\bme (?:faire du mal|tuer|blesser)\b|"
    # « en finir » : seulement en fin de proposition ou « en finir avec la vie/tout » (pas « en finir avec ce rapport »)
    r"\ben finir(?:\s+avec\s+(?:la vie|tout|moi)\b|\s*(?:[.!?,;]|$))|"
    r"(?:envie|veux|voudrais|vouloir) (?:de )?mourir(?! de (?:rire|faim|soif|sommeil|fatigue|chaud|froid|honte|peur|envie))|"
    r"plus envie de vivre|plus envie d'etre la|envie de disparaitre"
)
# « n'en peux plus » suivi d'un complément (de/du/des/d'…) est une expression courante (« de ce repas ») :
# ce n'est un mot-clé que s'il termine la phrase ou la proposition.
_AMBIGU = re.compile(r"crise de panique|attaque de panique|je panique|n'en peux plus(?!\s+(?:de|du|des|d')\b)")
_NEGATION_AVANT = re.compile(r"(?:\bpas\b|\bjamais\b|\baucune?\b|\bsans\b)[^.!?]{0,25}$")


def _normaliser(texte: str) -> str:
    sans_accents = unicodedata.normalize("NFKD", texte).encode("ascii", "ignore").decode()
    return sans_accents.lower().replace("’", "'")


def niveau_detresse(texte: str) -> str | None:
    """« grave » (alerte directe), « ambigu » (seul le modèle peut déclencher) ou None."""
    t = _normaliser(texte)
    nie = False
    for m in _GRAVE.finditer(t):
        if _NEGATION_AVANT.search(t[: m.start()]):
            nie = True
        else:
            return "grave"
    return "ambigu" if nie or _AMBIGU.search(t) else None


def mots_de_detresse(texte: str) -> bool:
    """Compatibilité : un propos grave ou ambigu est présent."""
    return niveau_detresse(texte) is not None


def _episodes(db: Session, colon_id: int):
    depuis = datetime.utcnow() - timedelta(hours=DELAI_H)
    return (
        db.query(models.Alerte, models.SuiviProtocole)
        .join(models.SuiviProtocole, models.SuiviProtocole.alerte_id == models.Alerte.id)
        .filter(models.Alerte.colon_id == colon_id, models.SuiviProtocole.protocole_id == PROTOCOLE_ID,
                models.Alerte.timestamp >= depuis)
    )


def alerte_recente(db: Session, colon_id: int) -> bool:
    """Un protocole de détresse a déjà été déclenché pour ce colon dans les dernières heures."""
    return _episodes(db, colon_id).first() is not None


def episode_termine_recent(db: Session, colon_id: int) -> bool:
    """Le colon vient de terminer un protocole de détresse : c'est la condition pour que l'IA puisse
    envisager un anxiolytique avec des constantes normales (jamais avant le protocole)."""
    return _episodes(db, colon_id).filter(models.SuiviProtocole.termine == True).first() is not None  # noqa: E712


def declencher(db: Session, colon: models.Colon) -> models.Alerte:
    """Crée l'alerte équipage et le suivi du protocole guidé (sans prescription automatique)."""
    alerte = models.Alerte(colon_id=colon.id, motif=MOTIF)
    db.add(alerte)
    db.flush()
    db.add(models.SuiviProtocole(alerte_id=alerte.id, colon_id=colon.id, protocole_id=PROTOCOLE_ID,
                                 etape_courante=0, termine=False))
    return alerte
