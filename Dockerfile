FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Le code Python vit dans backend/app/ sur l'hôte, mais on l'aplati
# à la racine du conteneur pour garder des imports simples (from database import ...)
COPY app/ .

RUN mkdir -p /app/data

EXPOSE 8000

# Crée le colon de démo au démarrage puis lance l'API
CMD ["sh", "-c", "python seed.py && uvicorn main:app --host 0.0.0.0 --port 8000"]
