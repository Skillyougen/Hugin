from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import engine, get_db, Base
import models
import schemas
from ia import generer_recommandation
from seuils import evaluer_mesure
from protocoles import selectionner_protocole, PROTOCOLES
from inventaire import appliquer_prescription
from auth import verifier_mot_de_passe, creer_session, get_current_colon

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Huginn API")

# CORS ouvert pour le front React en dev (webapp locale, pas d'accès Internet requis)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    colon = db.query(models.Colon).filter(models.Colon.identifiant == payload.identifiant).first()
    if not colon or not verifier_mot_de_passe(payload.mot_de_passe, colon.mot_de_passe_hash):
        raise HTTPException(status_code=401, detail="Identifiant ou mot de passe incorrect")

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

    couleur, _score, details = evaluer_mesure(
        mesure.frequence_cardiaque, mesure.spo2, mesure.temperature, mesure.sommeil_heures
    )
    resultat = generer_recommandation(
        fc=mesure.frequence_cardiaque,
        spo2=mesure.spo2,
        temp=mesure.temperature,
        sommeil=mesure.sommeil_heures,
    )

    reco = models.Recommandation(
        colon_id=colon.id,
        texte=resultat["texte"],
        type=resultat["type"],
        etat_couleur=couleur,
        source=resultat["source"],
    )
    db.add(reco)

    if couleur == "rouge":
        protocole = selectionner_protocole(details)
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
        .filter(models.Recommandation.colon_id == colon.id)
        .order_by(desc(models.Recommandation.timestamp))
        .limit(5)
        .all()
    )
    couleur = recos[0].etat_couleur if recos else "aucune_donnee"
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
def historique_mesures(range: str = "24h", colon: models.Colon = Depends(get_current_colon), db: Session = Depends(get_db)):
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
    return _construire_protocole_actif(alerte, alerte.suivi)


@app.get("/medicaments", response_model=list[schemas.MedicamentOut])
def lister_medicaments(db: Session = Depends(get_db), colon: models.Colon = Depends(get_current_colon)):
    """Vue de l'inventaire de bord, utile pour montrer le compteur en démo."""
    return db.query(models.Medicament).order_by(models.Medicament.nom).all()


def _construire_protocole_actif(alerte: models.Alerte, suivi: models.SuiviProtocole) -> schemas.ProtocoleActifOut:
    proto = PROTOCOLES[suivi.protocole_id]
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
        etapes=proto["etapes"],
        etape_courante=suivi.etape_courante,
        termine=suivi.termine,
        prescription=prescription,
    )
