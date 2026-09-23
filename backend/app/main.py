import os
import threading
from datetime import datetime, timedelta
from typing import Literal
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import engine, get_db, Base
import models
import schemas
from ia import generer_recommandations, prechauffer_modele, repondre_chat
from seuils import evaluer_mesure
from protocoles import selectionner_protocole, PROTOCOLES
from inventaire import appliquer_prescription
from auth import (
    verifier_mot_de_passe, creer_session, get_current_colon, hash_factice,
    login_bloque, noter_echec, noter_succes,
)

Base.metadata.create_all(bind=engine)


def _migrer_colonnes() -> None:
    # create_all ne modifie pas une table existante : on ajoute à la main la
    # colonne apparue après la première version pour ne pas casser une base déjà créée.
    with engine.begin() as conn:
        colonnes = {r[1] for r in conn.exec_driver_sql("PRAGMA table_info(recommandations)")}
        if "mesure_id" not in colonnes:
            conn.exec_driver_sql("ALTER TABLE recommandations ADD COLUMN mesure_id INTEGER REFERENCES mesures(id)")


_migrer_colonnes()

if os.getenv("OLLAMA_WARMUP", "1") == "1":
    threading.Thread(target=prechauffer_modele, daemon=True).start()

app = FastAPI(title="Huginn API")

# CORS restreint aux origines du front (Docker : nginx sur :80 ; dev : Vite).
# Surchargeable : CORS_ORIGINS="http://hote1,http://hote2". Le jeton passe par
# l'en-tête Authorization (pas de cookie), donc pas d'allow_credentials.
ORIGINES = os.getenv(
    "CORS_ORIGINS",
    "http://localhost,http://127.0.0.1,http://localhost:5173,http://127.0.0.1:5173",
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ORIGINES],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/auth/login", response_model=schemas.LoginOut)
def login(payload: schemas.LoginIn, db: Session = Depends(get_db)):
    """
    Comptes pré-créés uniquement (§2 : pas d'auto-inscription) — voir seed.py.
    """
    if login_bloque(payload.identifiant):
        raise HTTPException(status_code=429, detail="Trop de tentatives, réessaie dans une minute")

    colon = db.query(models.Colon).filter(models.Colon.identifiant == payload.identifiant).first()
    # Toujours un calcul PBKDF2, même si le compte n'existe pas (timing constant).
    hache = colon.mot_de_passe_hash if colon else hash_factice()
    if not verifier_mot_de_passe(payload.mot_de_passe, hache) or not colon:
        noter_echec(payload.identifiant)
        raise HTTPException(status_code=401, detail="Identifiant ou mot de passe incorrect")

    noter_succes(payload.identifiant)
    token = creer_session(db, colon)
    return schemas.LoginOut(token=token, colon_id=colon.id, nom=colon.nom)


@app.get("/colons/moi", response_model=schemas.ColonOut)
def colon_courant(colon: models.Colon = Depends(get_current_colon)):
    return colon


@app.post("/mesures", response_model=schemas.MesureOut)
def recevoir_mesure(
    mesure: schemas.MesureIn,
    colon: models.Colon = Depends(get_current_colon),
    db: Session = Depends(get_db),
):
    """
    Import manuel d'une mesure par le colon connecté (§4 page 2). Enregistre
    la mesure, déclenche l'analyse IA (ou mode dégradé), enregistre la
    recommandation, et si l'état est rouge : sélectionne le protocole de
    premiers secours figé, applique sa prescription sur le stock, et crée
    une alerte équipage.
    """
    db_mesure = models.Mesure(colon_id=colon.id, **mesure.model_dump())
    db.add(db_mesure)
    db.flush()  # id de la mesure, pour rattacher les recommandations

    couleur, _score, details = evaluer_mesure(
        mesure.frequence_cardiaque, mesure.spo2, mesure.temperature, mesure.sommeil_heures
    )

    # Contexte propre à ce colon (§ ia.py : formulation uniquement, jamais
    # un signal de décision) — les échanges les plus récents en dernier.
    derniers_echanges = (
        db.query(models.HistoriqueConversation)
        .filter(models.HistoriqueConversation.colon_id == colon.id)
        .order_by(desc(models.HistoriqueConversation.timestamp))
        .limit(5)
        .all()
    )
    historique = [
        f"{h.message_utilisateur or '(pas de texte libre)'} -> {h.reponse_ia}"
        for h in reversed(derniers_echanges)
    ]

    # Une carte par thème, chacune rédigée par l'IA (repli par carte sur les règles).
    cartes = generer_recommandations(
        fc=mesure.frequence_cardiaque,
        spo2=mesure.spo2,
        temp=mesure.temperature,
        sommeil=mesure.sommeil_heures,
        symptomes=mesure.symptomes,
        historique=historique,
    )
    for carte in cartes:
        db.add(models.Recommandation(
            colon_id=colon.id, texte=carte["texte"], type=carte["type"],
            etat_couleur=couleur, source=carte["source"], mesure_id=db_mesure.id,
        ))
    db.add(models.HistoriqueConversation(
        colon_id=colon.id,
        message_utilisateur=mesure.symptomes,
        reponse_ia=cartes[0]["texte"],
    ))

    if couleur == "rouge":
        protocole = selectionner_protocole(details)
        # Un colon n'a qu'une alerte active à la fois : un nouvel import
        # critique remplace la précédente (sinon elle resterait orpheline,
        # car seul le protocole le plus récent est avancé par le colon).
        for ancienne in db.query(models.Alerte).filter(
            models.Alerte.colon_id == colon.id, models.Alerte.resolue == False  # noqa: E712
        ):
            ancienne.resolue = True
        alerte = models.Alerte(
            colon_id=colon.id,
            # Motif générique : l'équipage sait qu'il y a une urgence, jamais
            # le détail des constantes du colon (§5 confidentialité).
            motif="État critique détecté — assistance requise",
        )
        db.add(alerte)
        db.flush()  # pour obtenir alerte.id avant de créer le suivi

        if protocole:
            delivree = appliquer_prescription(db, protocole.get("prescription"))
            db.add(models.SuiviProtocole(
                alerte_id=alerte.id,
                colon_id=colon.id,
                protocole_id=protocole["id"],
                etape_courante=0,
                termine=False,
                medicament_delivre=delivree["medicament"] if delivree else None,
                dosage_delivre=delivree["dosage"] if delivree else None,
                duree_delivree=delivree["duree"] if delivree else None,
                utilise_alternative=delivree["utilise_alternative"] if delivree else False,
                stock_restant=delivree["stock_restant"] if delivree else None,
            ))

    db.commit()
    db.refresh(db_mesure)
    return db_mesure


@app.get("/etat", response_model=schemas.EtatGlobal)
def etat_global(colon: models.Colon = Depends(get_current_colon), db: Session = Depends(get_db)):
    derniere = (
        db.query(models.Mesure)
        .filter(models.Mesure.colon_id == colon.id)
        .order_by(desc(models.Mesure.timestamp))
        .first()
    )

    if derniere is None:
        # §4 : pas d'état vert par défaut tant qu'aucune donnée n'a été importée.
        return schemas.EtatGlobal(
            colon_id=colon.id, couleur="aucune_donnee", score=-1,
            derniere_mesure=None, recommandations=[], protocole_actif=None,
        )

    recos = (
        db.query(models.Recommandation)
        .filter(
            models.Recommandation.colon_id == colon.id,
            # Cartes du dernier import uniquement.
            models.Recommandation.mesure_id == derniere.id,
        )
        .order_by(models.Recommandation.id)  # ordre de priorité fixé à la création
        .limit(5)
        .all()
    )
    # Couleur recalculée depuis la dernière mesure (source de vérité), pas
    # depuis les cartes : robuste aux bases créées avant `mesure_id`.
    couleur, _, _ = evaluer_mesure(
        derniere.frequence_cardiaque, derniere.spo2, derniere.temperature, derniere.sommeil_heures
    )
    score = {"aucune_donnee": -1, "vert": 0, "orange": 1, "rouge": 2}.get(couleur, -1)

    alerte = (
        db.query(models.Alerte)
        .filter(models.Alerte.colon_id == colon.id, models.Alerte.resolue == False)  # noqa: E712
        .order_by(desc(models.Alerte.timestamp))
        .first()
    )
    protocole_actif = _construire_protocole_actif(alerte, alerte.suivi) if alerte and alerte.suivi else None

    return schemas.EtatGlobal(
        colon_id=colon.id, couleur=couleur, score=score,
        derniere_mesure=derniere, recommandations=recos, protocole_actif=protocole_actif,
    )


@app.get("/mesures", response_model=list[schemas.MesureOut])
def historique_mesures(range: Literal["24h", "7j"] = "24h", colon: models.Colon = Depends(get_current_colon), db: Session = Depends(get_db)):
    delta = timedelta(hours=24) if range == "24h" else timedelta(days=7)
    depuis = datetime.utcnow() - delta
    return (
        db.query(models.Mesure)
        .filter(models.Mesure.colon_id == colon.id, models.Mesure.timestamp >= depuis)
        .order_by(models.Mesure.timestamp)
        .all()
    )


@app.get("/recommandations", response_model=list[schemas.RecommandationOut])
def historique_recommandations(
    type: str | None = None,
    colon: models.Colon = Depends(get_current_colon),
    db: Session = Depends(get_db),
):
    query = db.query(models.Recommandation).filter(models.Recommandation.colon_id == colon.id)
    if type:
        query = query.filter(models.Recommandation.type == type)
    return query.order_by(desc(models.Recommandation.timestamp)).all()


@app.get("/historique-conversation", response_model=list[schemas.HistoriqueConversationOut])
def historique_conversation(colon: models.Colon = Depends(get_current_colon), db: Session = Depends(get_db)):
    """
    Échanges passés (symptômes décrits + réponse IA) du colon connecté,
    plus récents d'abord. C'est ce même historique qui sert de contexte à
    l'IA pour ses prochaines recommandations (voir recevoir_mesure).
    """
    return (
        db.query(models.HistoriqueConversation)
        .filter(models.HistoriqueConversation.colon_id == colon.id)
        .order_by(desc(models.HistoriqueConversation.timestamp))
        .all()
    )


@app.post("/protocole/etape-suivante", response_model=schemas.ProtocoleActifOut)
def avancer_protocole(colon: models.Colon = Depends(get_current_colon), db: Session = Depends(get_db)):
    """Le colon en crise avance pas à pas dans son propre protocole guidé."""
    alerte = (
        db.query(models.Alerte)
        .filter(models.Alerte.colon_id == colon.id, models.Alerte.resolue == False)  # noqa: E712
        .order_by(desc(models.Alerte.timestamp))
        .first()
    )
    if not alerte or not alerte.suivi:
        raise HTTPException(status_code=404, detail="Aucun protocole actif")

    suivi = alerte.suivi
    proto = PROTOCOLES[suivi.protocole_id]

    if not suivi.termine:
        suivi.etape_courante = min(suivi.etape_courante + 1, len(proto["etapes"]))
        if suivi.etape_courante >= len(proto["etapes"]):
            suivi.termine = True
            # Pas de médecin de bord pour lever l'alerte (§5) : elle se
            # résout d'elle-même une fois le protocole terminé.
            alerte.resolue = True

    db.commit()
    db.refresh(suivi)
    return _construire_protocole_actif(alerte, suivi)


@app.get("/alertes", response_model=list[schemas.AlerteOut])
def lister_alertes(db: Session = Depends(get_db), colon: models.Colon = Depends(get_current_colon)):
    """
    Vue équipage (§4 : bandeau des alertes actives) : aucune donnée brute du
    colon en crise, juste le fait qu'il y a urgence et où consulter le
    protocole ("Que faire ?").
    """
    alertes = (
        db.query(models.Alerte)
        .filter(models.Alerte.resolue == False)  # noqa: E712
        .order_by(desc(models.Alerte.timestamp))
        .all()
    )
    return [
        schemas.AlerteOut(
            id=a.id, colon_id=a.colon_id, colon_nom=a.colon.nom,
            motif=a.motif, timestamp=a.timestamp, resolue=a.resolue,
        )
        for a in alertes
    ]


@app.get("/alertes/{alerte_id}/protocole", response_model=schemas.ProtocoleActifOut)
def protocole_de_alerte(alerte_id: int, db: Session = Depends(get_db), colon: models.Colon = Depends(get_current_colon)):
    """
    "Que faire ?" (§4) : un membre d'équipage consulte en lecture seule le
    même protocole que celui suivi par le colon concerné.
    """
    alerte = db.query(models.Alerte).filter(models.Alerte.id == alerte_id).first()
    if not alerte:
        raise HTTPException(status_code=404, detail="Alerte introuvable")
    if not alerte.suivi:
        raise HTTPException(status_code=404, detail="Aucun protocole associé à cette alerte")
    # Le colon concerné garde sa propre rédaction ; les autres voient celle de l'aidant.
    return _construire_protocole_actif(alerte, alerte.suivi, equipage=alerte.colon_id != colon.id)


@app.get("/chat", response_model=list[schemas.MessageChatOut])
def historique_chat(
    limite: int = Query(50, ge=1, le=500),
    colon: models.Colon = Depends(get_current_colon),
    db: Session = Depends(get_db),
):
    """Conversation du colon connecté (`limite` derniers messages, plus anciens d'abord)."""
    derniers = (
        db.query(models.MessageChat)
        .filter(models.MessageChat.colon_id == colon.id)
        .order_by(desc(models.MessageChat.id))
        .limit(limite)
        .all()
    )
    return list(reversed(derniers))


@app.post("/chat", response_model=schemas.ChatOut)
def envoyer_message(
    payload: schemas.ChatIn,
    colon: models.Colon = Depends(get_current_colon),
    db: Session = Depends(get_db),
):
    """
    Message libre à Huginn (page Assistant). Réponse de l'IA, contextualisée par
    la dernière mesure, l'alerte en cours et les derniers échanges de CE colon ;
    réponse de secours si l'IA est indisponible. Ne modifie jamais l'état, le
    protocole ni le stock : ce message n'est qu'une conversation.
    """
    texte = payload.message.strip()
    if not texte:
        raise HTTPException(status_code=422, detail="Message vide")

    precedents = (
        db.query(models.MessageChat)
        .filter(models.MessageChat.colon_id == colon.id)
        .order_by(desc(models.MessageChat.id))
        .limit(6)
        .all()
    )
    conversation = [(msg.role, msg.texte) for msg in reversed(precedents)]

    derniere = (
        db.query(models.Mesure)
        .filter(models.Mesure.colon_id == colon.id)
        .order_by(desc(models.Mesure.timestamp))
        .first()
    )
    mesure = None
    couleur = "aucune_donnee"
    if derniere:
        mesure = {
            "frequence_cardiaque": derniere.frequence_cardiaque, "spo2": derniere.spo2,
            "temperature": derniere.temperature, "sommeil_heures": derniere.sommeil_heures,
        }
        couleur, _, _ = evaluer_mesure(*mesure.values())
    alerte = (
        db.query(models.Alerte)
        .filter(models.Alerte.colon_id == colon.id, models.Alerte.resolue == False)  # noqa: E712
        .order_by(desc(models.Alerte.timestamp))
        .first()
    )
    protocole_titre = PROTOCOLES[alerte.suivi.protocole_id]["titre"] if alerte and alerte.suivi else None

    message_user = models.MessageChat(colon_id=colon.id, role="user", texte=texte)
    db.add(message_user)
    reponse = repondre_chat(texte, conversation, mesure, couleur, protocole_titre)
    message_ia = models.MessageChat(colon_id=colon.id, role="assistant", texte=reponse["texte"], source=reponse["source"])
    db.add(message_ia)
    db.commit()
    db.refresh(message_user)
    db.refresh(message_ia)
    return schemas.ChatOut(utilisateur=message_user, assistant=message_ia)


@app.get("/medicaments", response_model=list[schemas.MedicamentOut])
def lister_medicaments(db: Session = Depends(get_db), colon: models.Colon = Depends(get_current_colon)):
    """Vue de l'inventaire de bord, utile pour montrer le compteur en démo."""
    return db.query(models.Medicament).order_by(models.Medicament.nom).all()


def _construire_protocole_actif(
    alerte: models.Alerte, suivi: models.SuiviProtocole, equipage: bool = False
) -> schemas.ProtocoleActifOut:
    proto = PROTOCOLES[suivi.protocole_id]
    nom = alerte.colon.nom
    # Le contenu reste figé (fichiers JSON) : la vue équipage est une seconde
    # rédaction des mêmes étapes, adressée à la personne qui aide.
    if equipage and proto.get("etapes_equipage"):
        etapes = [e.replace("{nom}", nom) for e in proto["etapes_equipage"]]
    else:
        etapes = proto["etapes"]
    equipage = equipage and etapes is not proto["etapes"]
    prescription = None
    if suivi.medicament_delivre:
        prescription = schemas.PrescriptionOut(
            medicament=suivi.medicament_delivre,
            dosage=suivi.dosage_delivre,
            duree=suivi.duree_delivree,
            stock_restant=suivi.stock_restant,
            utilise_alternative=suivi.utilise_alternative,
        )
    return schemas.ProtocoleActifOut(
        alerte_id=alerte.id,
        protocole_id=proto["id"],
        titre=proto["titre"],
        etapes=etapes,
        colon_nom=nom,
        vue="equipage" if equipage else "colon",
        etape_courante=suivi.etape_courante,
        termine=suivi.termine,
        prescription=prescription,
    )
