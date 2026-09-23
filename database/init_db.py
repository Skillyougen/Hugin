"""
Script d'initialisation de la base de données Huginn.
Crée le fichier huginn.db, exécute le schéma, et insère des données
de test dans les 4 tables : utilisateurs, donnees_medicales,
stock_medicament, historique_conversation.

Usage : python3 init_db.py
"""

import sqlite3
import os

DB_NAME = "huginn.db"
SCHEMA_FILE = "schema.sql"


def create_database():
    if os.path.exists(DB_NAME):
        os.remove(DB_NAME)
        print(f"Ancienne base '{DB_NAME}' supprimée.")

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    with open(SCHEMA_FILE, "r", encoding="utf-8") as f:
        cursor.executescript(f.read())
    print("Tables créées avec succès.")

    conn.commit()
    return conn


def insert_test_data(conn):
    cursor = conn.cursor()

    # 1. Utilisateur (colon)
    cursor.execute("INSERT INTO utilisateurs (nom, email) VALUES (?, ?)",
                    ("Erik", "erik@vaisseau.local"))
    colon_id = cursor.lastrowid
    print(f"Utilisateur créé : Erik (id={colon_id})")

    # 2. Données médicales
    cursor.execute("""
        INSERT INTO donnees_medicales (utilisateur_id, groupe_sanguin, allergies, antecedents, traitements_en_cours)
        VALUES (?, ?, ?, ?, ?)
    """, (colon_id, "O+", "Aucune connue", "RAS", "Aucun"))
    print("Données médicales insérées pour Erik.")

    # 3. Stock de médicaments
    medicaments = [
        ("Paracétamol", 40, "unite", 10, "2027-06-01"),
        ("Anxiolytique léger", 15, "unite", 5, "2027-03-15"),
        ("Solution de réhydratation", 20, "unite", 5, "2027-09-01"),
    ]
    cursor.executemany("""
        INSERT INTO stock_medicament (nom, quantite, unite, seuil_alerte, date_peremption)
        VALUES (?, ?, ?, ?, ?)
    """, medicaments)
    print("Stock de médicaments initialisé.")

    # 4. Historique de conversation
    cursor.execute("""
        INSERT INTO historique_conversation (utilisateur_id, message_utilisateur, reponse_ia)
        VALUES (?, ?, ?)
    """, (colon_id, "Je me sens fatigué aujourd'hui.",
          "Je comprends. Je vous recommande un repos court et de l'hydratation."))
    print("Historique de conversation initialisé.")

    conn.commit()


def verify_data(conn):
    cursor = conn.cursor()
    print("\n--- Vérification ---")
    tables = ["utilisateurs", "donnees_medicales", "stock_medicament", "historique_conversation"]
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        print(f"{table} : {cursor.fetchone()[0]}")


if __name__ == "__main__":
    conn = create_database()
    insert_test_data(conn)
    verify_data(conn)
    conn.close()
    print(f"\nTerminé. La base '{DB_NAME}' est prête dans ce dossier.")
