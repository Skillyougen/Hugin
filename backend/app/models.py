from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base


class Colon(Base):
    __tablename__ = "colons"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)
    identifiant = Column(String, unique=True, index=True, nullable=False)
    mot_de_passe_hash = Column(String, nullable=False)

    mesures = relationship("Mesure", back_populates="colon")
    recommandations = relationship("Recommandation", back_populates="colon")
    alertes = relationship("Alerte", back_populates="colon")
    historique_conversation = relationship("HistoriqueConversation", back_populates="colon")


class SessionAuth(Base):
    """Jeton de session opaque, créé à la connexion (voir auth.py)."""

    __tablename__ = "sessions_auth"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    colon_id = Column(Integer, ForeignKey("colons.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)


class Mesure(Base):
    __tablename__ = "mesures"

    id = Column(Integer, primary_key=True, index=True)
    colon_id = Column(Integer, ForeignKey("colons.id"), nullable=False)
    frequence_cardiaque = Column(Float, nullable=False)
    spo2 = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    sommeil_heures = Column(Float, nullable=False)
    # Texte libre optionnel ("je me sens...") : contexte pour l'IA
    # uniquement, ne joue jamais dans la selection du protocole figé
    # (qui reste basee sur les seuils des 4 constantes ci-dessus).
    symptomes = Column(String, nullable=True)
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
    # Mesure à l'origine de la carte : /etat n'affiche que les cartes du dernier
    # import. Nul pour les lignes créées avant l'ajout de cette colonne.
    mesure_id = Column(Integer, ForeignKey("mesures.id"), nullable=True)

    colon = relationship("Colon", back_populates="recommandations")


class Alerte(Base):
    __tablename__ = "alertes"

    id = Column(Integer, primary_key=True, index=True)
    colon_id = Column(Integer, ForeignKey("colons.id"), nullable=False)
    motif = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    # Pas de "vue" manuelle (§5 : aucun médecin de bord pour lever l'alerte) :
    # elle se résout d'elle-même quand le protocole guidé associé est terminé.
    resolue = Column(Boolean, default=False)

    colon = relationship("Colon", back_populates="alertes")
    suivi = relationship("SuiviProtocole", back_populates="alerte", uselist=False)


class HistoriqueConversation(Base):
    """
    Trace, par colon, chaque échange avec l'IA déclenché par un import de
    mesure (symptômes décrits + recommandation générée). Sert de contexte
    passé à l'IA lors des prochains échanges (voir ia.py) pour des réponses
    plus personnalisées — n'entre jamais dans le calcul de couleur ni le
    choix du protocole, qui restent basés uniquement sur les seuils.
    """

    __tablename__ = "historique_conversation"

    id = Column(Integer, primary_key=True, index=True)
    colon_id = Column(Integer, ForeignKey("colons.id"), nullable=False)
    message_utilisateur = Column(String, nullable=True)
    reponse_ia = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    colon = relationship("Colon", back_populates="historique_conversation")


class Medicament(Base):
    """Stock de bord, ressource commune à l'équipage (§5)."""

    __tablename__ = "medicaments"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, unique=True, nullable=False)
    quantite = Column(Integer, nullable=False, default=0)


class SuiviProtocole(Base):
    """
    Progression d'un colon dans un protocole de premiers secours figé
    (contenu des étapes en fichiers statiques, voir protocoles.py — ici on
    ne stocke que la progression et la prescription réellement délivrée).
    """

    __tablename__ = "suivis_protocole"

    id = Column(Integer, primary_key=True, index=True)
    alerte_id = Column(Integer, ForeignKey("alertes.id"), nullable=False)
    colon_id = Column(Integer, ForeignKey("colons.id"), nullable=False)
    protocole_id = Column(String, nullable=False)
    etape_courante = Column(Integer, default=0)
    termine = Column(Boolean, default=False)

    medicament_delivre = Column(String, nullable=True)
    dosage_delivre = Column(String, nullable=True)
    duree_delivree = Column(String, nullable=True)
    utilise_alternative = Column(Boolean, default=False)
    stock_restant = Column(Integer, nullable=True)
    # Médicament déjà délivré récemment : rien n'a été redébité (économie de stock).
    deja_prescrit = Column(Boolean, default=False)

    alerte = relationship("Alerte", back_populates="suivi")


class MessageChat(Base):
    """
    Conversation libre d'un colon avec Huginn (page Assistant). Propre à chaque
    colon ; le contenu n'entre jamais dans le calcul de l'état ni le choix du
    protocole (comme `symptomes`, il ne sert qu'à la formulation).
    """

    __tablename__ = "messages_chat"

    id = Column(Integer, primary_key=True, index=True)
    colon_id = Column(Integer, ForeignKey("colons.id"), nullable=False, index=True)
    role = Column(String, nullable=False)  # "user" ou "assistant"
    texte = Column(String, nullable=False)
    source = Column(String, nullable=True)  # assistant : "ia" ou "regles" (réponse de secours)
    timestamp = Column(DateTime, default=datetime.utcnow)


class Prescription(Base):
    """
    Journal des médicaments délivrés à un colon (protocole guidé ou chat). Sert
    à économiser le stock : délai minimum entre deux prises du même médicament
    et plafond quotidien (voir inventaire.py).
    """

    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    colon_id = Column(Integer, ForeignKey("colons.id"), nullable=False, index=True)
    medicament = Column(String, nullable=False)
    dosage = Column(String, nullable=False)
    duree = Column(String, nullable=False)
    origine = Column(String, nullable=False)  # "protocole" ou "chat"
    timestamp = Column(DateTime, default=datetime.utcnow)
