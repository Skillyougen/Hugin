import os
import requests
from seuils import evaluer_mesure, recommandations_regles

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
OLLAMA_TIMEOUT = float(os.getenv("OLLAMA_TIMEOUT", "8"))

SYSTEM_PROMPT = """Tu es Huginn, l'assistant psychologique et physique des colons \
à bord d'un vaisseau interstellaire. Tu t'adresses directement au colon, sur un ton \
bienveillant, calme et concis (3 phrases maximum).

Règles strictes :
- Tu ne poses AUCUN diagnostic médical.
- Tu ne prescris AUCUN médicament.
- Tu dois citer explicitement au moins une constante du colon (fréquence cardiaque, \
SpO2, température, ou heures de sommeil) dans ta recommandation.
- Tu proposes une action concrete et réalisable : repos, hydratation, exercice léger, \
respiration, ou contact avec un autre membre de l'équipage.
- Si les constantes indiquent une situation critique, dis clairement au colon \
de contacter le médecin de bord.
- Le colon peut décrire ce qu'il ressent en texte libre : sers-t'en pour adapter \
le ton de ta réponse, mais ce texte ne doit JAMAIS te faire poser un diagnostic \
ni changer la conduite à tenir — celle-ci est déjà fixée par les seuils et les \
protocoles figés du système, pas par toi.
"""


def generer_recommandation(fc: float, spo2: float, temp: float, sommeil: float, symptomes: str | None = None) -> dict:
    """
    Tente d'utiliser Ollama. Si erreur ou timeout, bascule sur le moteur de
    règles (mode dégradé) — exigence non fonctionnelle du cahier des charges.
    Retourne toujours: {"texte": str, "type": str, "source": "ia"|"regles"}

    `symptomes` (texte libre optionnel du colon) n'est qu'un contexte pour
    la formulation de la recommandation IA : il n'entre jamais dans le
    calcul de `couleur` ni dans la sélection du protocole (seuils.py /
    protocoles.py), qui restent basés uniquement sur les 4 constantes.
    """
    couleur, score, details = evaluer_mesure(fc, spo2, temp, sommeil)

    prompt = (
        f"Constantes actuelles du colon :\n"
        f"- Fréquence cardiaque : {fc:.0f} bpm\n"
        f"- SpO2 : {spo2:.0f}%\n"
        f"- Température : {temp:.1f}°C\n"
        f"- Sommeil la nuit dernière : {sommeil:.1f}h\n"
        f"- État global calculé : {couleur}\n"
    )
    if symptomes:
        prompt += f"- Ce que le colon décrit ressentir : {symptomes}\n"
    prompt += "\nDonne une recommandation courte et bienveillante."

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "system": SYSTEM_PROMPT,
                "stream": False,
            },
            timeout=OLLAMA_TIMEOUT,
        )
        response.raise_for_status()
        texte = response.json().get("response", "").strip()
        if not texte:
            raise ValueError("Réponse vide d'Ollama")

        return {
            "texte": texte,
            "type": _deviner_type(texte),
            "source": "ia",
            "couleur": couleur,
        }

    except (requests.RequestException, ValueError, KeyError):
        # Mode dégradé : le moteur de règles prend le relais
        recos = recommandations_regles(fc, spo2, temp, sommeil)
        premiere = recos[0]
        return {
            "texte": premiere["texte"],
            "type": premiere["type"],
            "source": "regles",
            "couleur": couleur,
        }


def _deviner_type(texte: str) -> str:
    texte_lower = texte.lower()
    if "respir" in texte_lower:
        return "respiration"
    if "hydrat" in texte_lower or "eau" in texte_lower:
        return "hydratation"
    if "repos" in texte_lower or "dorm" in texte_lower or "sommeil" in texte_lower:
        return "repos"
    if "exercic" in texte_lower or "marche" in texte_lower or "sport" in texte_lower:
        return "exercice"
    return "social"
