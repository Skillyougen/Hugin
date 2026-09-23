"""Connexion SQLite (fichier local, pas de dépendance externe)."""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# En local : ./huginn.db à la racine du dossier backend
# En Docker : /app/data/huginn.db, sur le volume "backend_data" (persiste entre redémarrages)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./huginn.db")

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
