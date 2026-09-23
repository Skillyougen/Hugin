-- ============================================
-- Schéma de base de données - Projet Huginn
-- ============================================

-- Table des utilisateurs (colons)
CREATE TABLE IF NOT EXISTS utilisateurs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    email TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table des données médicales
CREATE TABLE IF NOT EXISTS donnees_medicales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    utilisateur_id INTEGER NOT NULL,
    groupe_sanguin TEXT,
    allergies TEXT,
    antecedents TEXT,                     -- antécédents médicaux
    traitements_en_cours TEXT,            -- médicaments pris actuellement
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
);

-- Table du stock de médicaments disponibles à bord
CREATE TABLE IF NOT EXISTS stock_medicament (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    quantite INTEGER NOT NULL DEFAULT 0,
    unite TEXT DEFAULT 'unite',           -- 'unite', 'ml', 'mg'...
    seuil_alerte INTEGER DEFAULT 5,       -- quantité en dessous de laquelle il faut alerter
    date_peremption TEXT
);

-- Table de l'historique des conversations avec l'assistant IA
CREATE TABLE IF NOT EXISTS historique_conversation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    utilisateur_id INTEGER NOT NULL,
    date TEXT DEFAULT CURRENT_TIMESTAMP,
    message_utilisateur TEXT,
    reponse_ia TEXT,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
);
