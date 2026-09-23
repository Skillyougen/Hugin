from datetime import datetime
from pydantic import BaseModel


class MesureIn(BaseModel):
    colon_id: int
    frequence_cardiaque: float
    spo2: float
    temperature: float
    sommeil_heures: float


class MesureOut(MesureIn):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True


class RecommandationOut(BaseModel):
    id: int
    texte: str
    type: str
    etat_couleur: str
    source: str
    timestamp: datetime

    class Config:
        from_attributes = True


class EtatGlobal(BaseModel):
    colon_id: int
    couleur: str  # vert, orange, rouge
    score: int
    derniere_mesure: MesureOut | None
    recommandations: list[RecommandationOut]
    alerte_active: bool


class AlerteOut(BaseModel):
    id: int
    colon_id: int
    motif: str
    timestamp: datetime
    vue_par_medecin: bool

    class Config:
        from_attributes = True
