from datetime import datetime, timezone
from typing import Annotated
from pydantic import BaseModel, Field, PlainSerializer


def _iso_utc(d: datetime) -> str:
    # La base stocke de l'UTC naïf ; sans suffixe « Z », `new Date()` côté
    # navigateur l'interprète en heure locale (décalage de 1-2 h à l'écran).
    if d.tzinfo is None:
        d = d.replace(tzinfo=timezone.utc)
    return d.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


UtcDatetime = Annotated[datetime, PlainSerializer(_iso_utc, return_type=str)]


class LoginIn(BaseModel):
    identifiant: str
    mot_de_passe: str


class LoginOut(BaseModel):
    token: str
    colon_id: int
    nom: str


class ColonOut(BaseModel):
    id: int
    nom: str

    class Config:
        from_attributes = True


class MesureIn(BaseModel):
    """
    Plages plausibles (§5 : toute constante hors plage bloque l'import).
    Le colon_id ne se saisit pas ici : il vient du compte connecté.
    """

    frequence_cardiaque: float = Field(..., ge=20, le=250, description="battements par minute")
    spo2: float = Field(..., ge=0, le=100, description="pourcentage")
    temperature: float = Field(..., ge=30, le=42, description="degrés Celsius")
    sommeil_heures: float = Field(..., ge=0, le=24, description="heures la nuit précédente")
    # Texte libre optionnel. Contexte donné à l'IA pour la recommandation
    # bien-être uniquement : ne déclenche et ne change jamais un protocole
    # (qui reste choisi par les seuils ci-dessus, jamais par l'IA elle-même).
    symptomes: str | None = Field(default=None, max_length=500)


class MesureOut(MesureIn):
    id: int
    colon_id: int
    timestamp: UtcDatetime

    class Config:
        from_attributes = True


class RecommandationOut(BaseModel):
    id: int
    texte: str
    type: str
    etat_couleur: str
    source: str
    timestamp: UtcDatetime

    class Config:
        from_attributes = True


class HistoriqueConversationOut(BaseModel):
    id: int
    message_utilisateur: str | None
    reponse_ia: str
    timestamp: UtcDatetime

    class Config:
        from_attributes = True


class PrescriptionOut(BaseModel):
    medicament: str
    dosage: str
    duree: str
    stock_restant: int
    utilise_alternative: bool


class ProtocoleActifOut(BaseModel):
    alerte_id: int
    protocole_id: str
    titre: str
    etapes: list[str]
    etape_courante: int
    termine: bool
    prescription: PrescriptionOut | None


class EtatGlobal(BaseModel):
    colon_id: int
    # "aucune_donnee" avant le premier import (§4 : pas de vert par défaut),
    # sinon vert / orange / rouge selon la dernière recommandation.
    couleur: str
    score: int
    derniere_mesure: MesureOut | None
    recommandations: list[RecommandationOut]
    protocole_actif: ProtocoleActifOut | None


class AlerteOut(BaseModel):
    """
    Vue équipage : jamais le détail des constantes du colon (§5), juste le
    fait qu'une situation à risque existe et le nom du colon concerné.
    """

    id: int
    colon_id: int
    colon_nom: str
    motif: str
    timestamp: UtcDatetime
    resolue: bool

    class Config:
        from_attributes = True


class MedicamentOut(BaseModel):
    id: int
    nom: str
    quantite: int

    class Config:
        from_attributes = True
