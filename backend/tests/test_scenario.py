"""Scénario de démo du cahier des charges §8, bout en bout, Ollama coupé (mode dégradé)."""
import os
import sys
import tempfile
import pathlib

_tmp = tempfile.mkdtemp()
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp}/test.db"
os.environ["OLLAMA_URL"] = "http://127.0.0.1:9/none"
os.environ["OLLAMA_WARMUP"] = "0"
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent / "app"))

from fastapi.testclient import TestClient

import seed  # noqa: F401  (crée comptes + stock)
from main import app

client = TestClient(app)
NORMAL = {"frequence_cardiaque": 72, "spo2": 98, "temperature": 36.8, "sommeil_heures": 7.5}
STRESS = {"frequence_cardiaque": 115, "spo2": 97, "temperature": 36.8, "sommeil_heures": 5}
CRISE = {"frequence_cardiaque": 100, "spo2": 88, "temperature": 36.8, "sommeil_heures": 7}


def auth(identifiant, mdp):
    r = client.post("/auth/login", json={"identifiant": identifiant, "mot_de_passe": mdp})
    assert r.status_code == 200
    return {"Authorization": f"Bearer {r.json()['token']}"}


def test_login_refuse():
    assert client.post("/auth/login", json={"identifiant": "erik", "mot_de_passe": "x"}).status_code == 401
    assert client.get("/etat").status_code in (401, 403, 422)


def test_scenario_complet():
    erik, nyota = auth("erik", "erik1234"), auth("nyota", "nyota1234")
    assert client.get("/etat", headers=erik).json()["couleur"] == "aucune_donnee"

    client.post("/mesures", json=NORMAL, headers=erik)
    assert client.get("/etat", headers=erik).json()["couleur"] == "vert"

    client.post("/mesures", json=STRESS, headers=erik)
    etat = client.get("/etat", headers=erik).json()
    assert etat["couleur"] == "orange" and etat["protocole_actif"] is None

    stock = {m["nom"]: m["quantite"] for m in client.get("/medicaments", headers=erik).json()}
    client.post("/mesures", json=CRISE, headers=erik)
    etat = client.get("/etat", headers=erik).json()
    assert etat["couleur"] == "rouge" and etat["protocole_actif"]["protocole_id"] == "hypoxie"
    p = etat["protocole_actif"]["prescription"]
    assert p["stock_restant"] == stock[p["medicament"]] - 1

    # Isolation + alerte visible de l'équipage sans constantes
    assert client.get("/mesures", headers=nyota).json() == []
    alertes = client.get("/alertes", headers=nyota).json()
    assert len(alertes) == 1 and "frequence_cardiaque" not in alertes[0]
    proto = client.get(f"/alertes/{alertes[0]['id']}/protocole", headers=nyota).json()
    assert proto["etape_courante"] == 0  # lecture seule

    # Un second import critique remplace l'alerte au lieu d'en empiler une
    client.post("/mesures", json=CRISE, headers=erik)
    assert len(client.get("/alertes", headers=nyota).json()) == 1

    for _ in range(len(proto["etapes"])):
        last = client.post("/protocole/etape-suivante", headers=erik).json()
    assert last["termine"] is True
    assert client.get("/alertes", headers=nyota).json() == []


def test_validation():
    erik = auth("erik", "erik1234")
    assert client.post("/mesures", json={**NORMAL, "spo2": 150}, headers=erik).status_code == 422
    assert client.post("/mesures", json={"spo2": 98}, headers=erik).status_code == 422


def test_medicament_absent_alternative():
    erik = auth("erik", "erik1234")
    r = client.post("/mesures", json={"frequence_cardiaque": 100, "spo2": 98, "temperature": 39.5, "sommeil_heures": 7}, headers=erik)
    assert r.status_code == 200
    p = client.get("/etat", headers=erik).json()["protocole_actif"]
    assert p["protocole_id"] == "hyperthermie" and p["prescription"]["utilise_alternative"] is True


def test_plusieurs_recommandations_et_timestamps_utc():
    nyota = auth("nyota", "nyota1234")
    client.post("/mesures", json={"frequence_cardiaque": 115, "spo2": 97, "temperature": 36.8, "sommeil_heures": 5}, headers=nyota)
    etat = client.get("/etat", headers=nyota).json()
    types = {r["type"] for r in etat["recommandations"]}
    assert {"repos", "respiration", "hydratation"} <= types
    # Chaque conseil cite une constante (critère §8)
    assert all(any(c in r["texte"] for c in ("bpm", "°C", "h", "%")) for r in etat["recommandations"])
    assert etat["derniere_mesure"]["timestamp"].endswith("Z")


def test_login_bloque_apres_echecs_repetes():
    for _ in range(5):
        assert client.post("/auth/login", json={"identifiant": "inconnu", "mot_de_passe": "x"}).status_code == 401
    assert client.post("/auth/login", json={"identifiant": "inconnu", "mot_de_passe": "x"}).status_code == 429


def test_session_expiree():
    from datetime import datetime, timedelta
    import models
    from database import SessionLocal
    headers = auth("nyota", "nyota1234")
    db = SessionLocal()
    for s in db.query(models.SessionAuth):
        s.timestamp = datetime.utcnow() - timedelta(hours=13)
    db.commit()
    db.close()
    assert client.get("/etat", headers=headers).status_code == 401


def test_range_invalide_et_garde_fou_ia():
    headers = auth("erik", "erik1234")
    assert client.get("/mesures?range=1an", headers=headers).status_code == 422
    from ia import reponse_acceptable
    assert reponse_acceptable("Ta FC est à 115 bpm, respire calmement quelques minutes.")
    assert not reponse_acceptable("Prends 2 mg de propranolol.")
    assert not reponse_acceptable("")
    assert not reponse_acceptable("Ta SpO2 est basse mais ce n'est pas grave.")
    from ia import terminer_proprement
    coupe = "Ta SpO2 est à 92.5%. Respire lentement. Tu peux aussi boire de l'eau et te reposer un p"
    assert terminer_proprement(coupe) == "Ta SpO2 est à 92.5%. Respire lentement."
    assert terminer_proprement("phrase sans fin") == ""


def test_etat_ne_montre_que_les_cartes_du_dernier_import():
    h = auth("nyota", "nyota1234")
    client.post("/mesures", json=NORMAL, headers=h)
    client.post("/mesures", json=STRESS, headers=h)  # immédiatement après : même seconde
    types = {r["type"] for r in client.get("/etat", headers=h).json()["recommandations"]}
    assert "social" not in types  # carte « constantes normales » du 1er import
    assert {"repos", "respiration", "hydratation"} <= types


def test_vue_equipage_redigee_pour_l_aidant():
    erik, nyota = auth("erik", "erik1234"), auth("nyota", "nyota1234")
    client.post("/mesures", json=CRISE, headers=erik)
    propre = client.get("/etat", headers=erik).json()["protocole_actif"]
    alerte_id = client.get("/alertes", headers=nyota).json()[0]["id"]
    equipe = client.get(f"/alertes/{alerte_id}/protocole", headers=nyota).json()
    assert propre["vue"] == "colon" and equipe["vue"] == "equipage"
    assert len(propre["etapes"]) == len(equipe["etapes"])  # mêmes étapes, même progression
    assert "ton nez" in " ".join(propre["etapes"])
    texte = " ".join(equipe["etapes"])
    assert "Erik" in texte and "ton " not in texte and "{nom}" not in texte
    assert equipe["colon_nom"] == "Erik"
    # Le colon concerné qui consulte via l'alerte garde sa propre rédaction
    assert client.get(f"/alertes/{alerte_id}/protocole", headers=erik).json()["vue"] == "colon"


def test_cartes_complementaires_quand_l_ia_repond(monkeypatch):
    import main as m
    monkeypatch.setattr(m, "generer_recommandation", lambda **kw: {
        "texte": "Ta FC est à 115 bpm, respire calmement.", "type": "respiration", "source": "ia"})
    h = auth("nyota", "nyota1234")
    client.post("/mesures", json=STRESS, headers=h)
    sources = {r["type"]: r["source"] for r in client.get("/etat", headers=h).json()["recommandations"]}
    assert sources["respiration"] == "ia"
    assert all(s == "complement" for t, s in sources.items() if t != "respiration")
