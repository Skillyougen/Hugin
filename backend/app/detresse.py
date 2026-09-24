"""
Détresse psychologique : protocole guidé figé (protocoles/detresse_psychologique.json)
et alerte à l'équipage (motif générique : rien de ce qui a été dit dans le chat n'est transmis).

Deux déclencheurs :
- un filet de sécurité par mots-clés sur le message du colon, côté serveur, qui ne dépend
  pas du modèle (idées de se faire du mal, crise de panique…) : il ne peut pas être « raté » ;
- le jugement du modèle-médecin (ligne « DETRESSE: OUI » de sa réponse), limité à un
  déclenchement par 12 h et par colon pour ne pas inonder l'équipage.
Les faux positifs sont préférés aux oublis.
"""
import re
import unicodedata
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

import models

PROTOCOLE_ID = "detresse_psychologique"
MOTIF = "Un colon a besoin d'un soutien immédiat"
DELAI_H = 12

_MOTS_DETRESSE = re.compile(
    r"suicid|\bme (?:faire du mal|tuer|blesser)\b|\ben finir\b|"
    r"(?:envie|veux|voudrais|vouloir) (?:de )?mourir|plus envie de vivre|plus envie d'etre la|"
    r"envie de disparaitre|crise de panique|attaque de panique|je panique|n'en peux plus"
)


def _normaliser(texte: str) -> str:
    sans_accents = unicodedata.normalize("NFKD", texte).encode("ascii", "ignore").decode()
    return sans_accents.lower().replace("’", "'")


def mots_de_detresse(texte: str) -> bool:
    return _MOTS_DETRESSE.search(_normaliser(texte)) is not None


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
