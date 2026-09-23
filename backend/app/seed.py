"""Crée le colon de démo 'Erik' utilisé dans le scénario de démo."""
from database import SessionLocal, engine, Base
import models

Base.metadata.create_all(bind=engine)

db = SessionLocal()
existe = db.query(models.Colon).filter(models.Colon.nom == "Erik").first()
if not existe:
    erik = models.Colon(nom="Erik")
    db.add(erik)
    db.commit()
    db.refresh(erik)
    print(f"Colon créé : id={erik.id}, nom={erik.nom}")
else:
    print(f"Colon déjà présent : id={existe.id}")
db.close()
