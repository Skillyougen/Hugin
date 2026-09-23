from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import engine, get_db, Base
import models
import schemas
from ia import generer_recommandation

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


@app.post("/colons")
def creer_colon(nom: str, db: Session = Depends(get_db)):
    colon = models.Colon(nom=nom)
    db.add(colon)
    db.commit()
    db.refresh(colon)
    return {"id": colon.id, "nom": colon.nom}


@app.post("/mesures", response_model=schemas.MesureOut)
def recevoir_mesure(mesure: schemas.MesureIn, db: Session = Depends(get_db)):
    """
    Point d'entrée du simulateur (Bloc 1). Enregistre la mesure, déclenche
    l'analyse IA (ou mode dégradé), enregistre la recommandation, et crée
    une alerte si l'état est rouge.
    """
    colon = db.query(models.Colon).filter(models.Colon.id == mesure.colon_id).first()
    if not colon:
        raise HTTPException(status_code=404, detail="Colon introuvable")

    db_mesure = models.Mesure(**mesure.model_dump())
    db.add(db_mesure)
    db.commit()
    db.refresh(db_mesure)

    resultat = generer_recommandation(
        fc=mesure.frequence_cardiaque,
        spo2=mesure.spo2,
        temp=mesure.temperature,
        sommeil=mesure.sommeil_heures,
    )

    reco = models.Recommandation(
        colon_id=mesure.colon_id,
        texte=resultat["texte"],
        type=resultat["type"],
        etat_couleur=resultat["couleur"],
        source=resultat["source"],
    )
    db.add(reco)

    if resultat["couleur"] == "rouge":
        alerte = models.Alerte(
            colon_id=mesure.colon_id,
            motif=f"État critique détecté (FC={mesure.frequence_cardiaque:.0f}, "
                  f"SpO2={mesure.spo2:.0f}%, temp={mesure.temperature:.1f}°C, "
                  f"sommeil={mesure.sommeil_heures:.1f}h)",
        )
        db.add(alerte)

    db.commit()
    return db_mesure


@app.get("/colons/{colon_id}/etat", response_model=schemas.EtatGlobal)
def etat_global(colon_id: int, db: Session = Depends(get_db)):
    derniere = (
        db.query(models.Mesure)
        .filter(models.Mesure.colon_id == colon_id)
        .order_by(desc(models.Mesure.timestamp))
        .first()
    )
    recos = (
        db.query(models.Recommandation)
        .filter(models.Recommandation.colon_id == colon_id)
        .order_by(desc(models.Recommandation.timestamp))
        .limit(5)
        .all()
    )
    couleur = recos[0].etat_couleur if recos else "vert"

    alerte_active = (
        db.query(models.Alerte)
        .filter(models.Alerte.colon_id == colon_id, models.Alerte.vue_par_medecin == False)
        .order_by(desc(models.Alerte.timestamp))
        .first()
        is not None
    )

    score = {"vert": 0, "orange": 1, "rouge": 2}.get(couleur, 0)

    return schemas.EtatGlobal(
        colon_id=colon_id,
        couleur=couleur,
        score=score,
        derniere_mesure=derniere,
        recommandations=recos,
        alerte_active=alerte_active,
    )


@app.get("/colons/{colon_id}/mesures", response_model=list[schemas.MesureOut])
def historique_mesures(colon_id: int, range: str = "24h", db: Session = Depends(get_db)):
    delta = timedelta(hours=24) if range == "24h" else timedelta(days=7)
    depuis = datetime.utcnow() - delta
    return (
        db.query(models.Mesure)
        .filter(models.Mesure.colon_id == colon_id, models.Mesure.timestamp >= depuis)
        .order_by(models.Mesure.timestamp)
        .all()
    )


@app.get("/colons/{colon_id}/recommandations", response_model=list[schemas.RecommandationOut])
def historique_recommandations(colon_id: int, type: str | None = None, db: Session = Depends(get_db)):
    query = db.query(models.Recommandation).filter(models.Recommandation.colon_id == colon_id)
    if type:
        query = query.filter(models.Recommandation.type == type)
    return query.order_by(desc(models.Recommandation.timestamp)).all()


@app.get("/alertes", response_model=list[schemas.AlerteOut])
def lister_alertes(db: Session = Depends(get_db)):
    """Vue du médecin de bord : uniquement les alertes, pas les données brutes."""
    return db.query(models.Alerte).order_by(desc(models.Alerte.timestamp)).all()


@app.post("/alertes/{alerte_id}/vue")
def marquer_alerte_vue(alerte_id: int, db: Session = Depends(get_db)):
    alerte = db.query(models.Alerte).filter(models.Alerte.id == alerte_id).first()
    if not alerte:
        raise HTTPException(status_code=404, detail="Alerte introuvable")
    alerte.vue_par_medecin = True
    db.commit()
    return {"ok": True}
