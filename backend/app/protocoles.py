"""
Chargement des protocoles de premiers secours (contenu médical figé,
écrit à l'avance — cahier des charges §5 et §6). Fichiers statiques
JSON versionnés dans protocoles/, jamais générés ni modifiés par l'IA.
"""
import json
import pathlib

DOSSIER = pathlib.Path(__file__).parent / "protocoles"

# Priorité de sélection quand plusieurs constantes sont critiques en même
# temps : on ne déclenche qu'un seul protocole par mesure (cahier des
# charges §6 : "sélectionne LE protocole"). L'hypoxie prime car une SpO2
# basse menace le plus vite le pronostic vital, suivie du cardiaque, de la
# thermique, puis de l'épuisement (moins immédiatement vital).
ORDRE_PRIORITE = ["spo2", "frequence_cardiaque", "temperature", "sommeil"]


def _charger_protocoles() -> dict:
    protocoles = {}
    for fichier in DOSSIER.glob("*.json"):
        data = json.loads(fichier.read_text(encoding="utf-8"))
        protocoles[data["id"]] = data
    return protocoles


PROTOCOLES = _charger_protocoles()


def selectionner_protocole(details: dict) -> dict | None:
    """
    `details` : sortie de seuils.evaluer_mesure(...)[2], ex.
    {"frequence_cardiaque": 2, "spo2": 0, "temperature": 1, "sommeil": 0}.
    Retourne le protocole figé à déclencher, ou None si rien n'est critique.
    """
    for constante in ORDRE_PRIORITE:
        if details.get(constante, 0) >= 2:
            for protocole in PROTOCOLES.values():
                decl = protocole["declencheur"]
                if decl["constante"] == constante and details[constante] >= decl["niveau_minimal"]:
                    return protocole
    return None
