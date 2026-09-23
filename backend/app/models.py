from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base


class Colon(Base):
    __tablename__ = "colons"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)

    mesures = relationship("Mesure", back_populates="colon")
    recommandations = relationship("Recommandation", back_populates="colon")
    alertes = relationship("Alerte", back_populates="colon")


class Mesure(Base):
    __tablename__ = "mesures"

    id = Column(Integer, primary_key=True, index=True)
    colon_id = Column(Integer, ForeignKey("colons.id"), nullable=False)
    frequence_cardiaque = Column(Float, nullable=False)
    spo2 = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    sommeil_heures = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    colon = relationship("Colon", back_populates="mesures")


class Recommandation(Base):
    __tablename__ = "recommandations"

    id = Column(Integer, primary_key=True, index=True)
    colon_id = Column(Integer, ForeignKey("colons.id"), nullable=False)
    texte = Column(String, nullable=False)
    type = Column(String, nullable=False)  # repos, hydratation, exercice, social, respiration
    etat_couleur = Column(String, nullable=False)  # vert, orange, rouge
    source = Column(String, nullable=False)  # "ia" ou "regles"
    timestamp = Column(DateTime, default=datetime.utcnow)

    colon = relationship("Colon", back_populates="recommandations")


class Alerte(Base):
    __tablename__ = "alertes"

    id = Column(Integer, primary_key=True, index=True)
    colon_id = Column(Integer, ForeignKey("colons.id"), nullable=False)
    motif = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    vue_par_medecin = Column(Boolean, default=False)

    colon = relationship("Colon", back_populates="alertes")
