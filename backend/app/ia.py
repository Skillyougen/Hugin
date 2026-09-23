import logging
import os
import re
import time
import requests
from seuils import evaluer_mesure, recommandations_regles

logger = logging.getLogger("huginn.ia")

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
OLLAMA_TIMEOUT = float(os.getenv("OLLAMA_TIMEOUT", "30"))
# Le modèle reste en mémoire entre deux imports (sinon chaque appel après une
# pause paie de nouveau le chargement, plusieurs minutes sur CPU modeste).
OLLAMA_KEEP_ALIVE = os.getenv("OLLAMA_KEEP_ALIVE", "24h")
# Réponse courte (3 phrases) : plafonner les tokens borne directement le temps de génération.
OLLAMA_MAX_TOKENS = int(os.getenv("OLLAMA_MAX_TOKENS", "160"))

SYSTEM_PROMPT = """Tu es Huginn, l'assistant psychologique et physique des colons \
à bord d'un vaisseau interstellaire. Tu t'adresses directement au colon, sur un ton \
bienveillant, calme et concis (3 phrases maximum).

Règles strictes :
- Tu tutoies toujours le colon (« tu », jamais « vous »), sans salutation ni « Bonjour ».
- Tu ne minimises jamais la situation : n'écris jamais « ce n'est pas grave » ni « rien de grave ».
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
- Un historique des échanges précédents avec ce colon peut t'être donné comme \
contexte : sers-t'en uniquement pour personnaliser le ton et éviter de te \
répéter, jamais pour poser un diagnostic ni changer la conduite à tenir.
"""


# Garde-fou de sortie (§5) : l'IA ne rédige jamais de posologie ni de nom de
# médicament. Si sa réponse en contient (ou dérive du format), on ignore le
# texte du modèle et on bascule sur le moteur de règles, comme en cas de panne.
_INTERDIT = re.compile(
    r"\b\d+([.,]\d+)?\s?((mg|g|ml|mcg|µg)\b|comprim|gélule|ampoule|dose|goutte)|"
    r"paracétamol|ibuprofène|aspirine|propranolol|morphine|diazépam|anxiolytique|"
    r"vasopresseur|bronchodilatateur|prescri|pas grave|rien de grave",
    re.IGNORECASE,
)
TEXTE_MAX = 1200  # ~160 tokens en français peuvent dépasser 600 caractères


def prechauffer_modele() -> None:
    """
    Charge le modèle en mémoire au démarrage du backend (appel sans prompt),
    pour que le premier vrai import ne paie pas le chargement. Sans effet si
    Ollama est absent : le mode dégradé prend le relais comme d'habitude.
    """
    for _ in range(12):  # Ollama peut démarrer après le backend
        try:
            requests.post(
                OLLAMA_URL,
                json={"model": OLLAMA_MODEL, "prompt": "", "stream": False, "keep_alive": OLLAMA_KEEP_ALIVE},
                timeout=900,
            ).raise_for_status()
            return
        except requests.RequestException:
            time.sleep(5)


def terminer_proprement(texte: str) -> str:
    """
    Le plafond de tokens peut couper la réponse en plein milieu d'une phrase :
    on garde jusqu'à la dernière phrase complète. Vide si aucune phrase n'est
    terminée (la réponse est alors écartée, mode règles).
    """
    texte = texte.strip()
    fins = [m.end() for m in re.finditer(r"[.!?…](?=\s|$)", texte)]
    return texte[: fins[-1]].strip() if fins else ""


def reponse_acceptable(texte: str) -> bool:
    return 0 < len(texte) <= TEXTE_MAX and not _INTERDIT.search(texte)


def recommandations_complementaires(fc, spo2, temp, sommeil, deja_types: set[str]) -> list[dict]:
    """
    Cartes supplémentaires issues du moteur de règles (un type de carte par
    catégorie : repos, hydratation, exercice, respiration…), pour que l'accueil
    affiche plusieurs conseils par import (§4) même quand l'IA n'en rédige qu'un.
    Contenu déterministe, cite toujours une constante.
    """
    return [r for r in recommandations_regles(fc, spo2, temp, sommeil) if r["type"] not in deja_types]


def generer_recommandation(
    fc: float,
    spo2: float,
    temp: float,
    sommeil: float,
    symptomes: str | None = None,
    historique: list[str] | None = None,
) -> dict:
    """
    Tente d'utiliser Ollama. Si erreur ou timeout, bascule sur le moteur de
    règles (mode dégradé) — exigence non fonctionnelle du cahier des charges.
    Retourne toujours: {"texte": str, "type": str, "source": "ia"|"regles"}

    `symptomes` (texte libre optionnel du colon) n'est qu'un contexte pour
    la formulation de la recommandation IA : il n'entre jamais dans le
    calcul de `couleur` ni dans la sélection du protocole (seuils.py /
    protocoles.py), qui restent basés uniquement sur les 4 constantes.

    `historique` (optionnel) : quelques échanges précédents de CE colon
    ("message -> réponse"), du plus ancien au plus récent, pour donner à
    l'IA un contexte propre à la personne (continuité, ton). Même garde-fou
    que `symptomes` : contexte de formulation uniquement, jamais un signal
    de décision.
    """
    couleur, score, details = evaluer_mesure(fc, spo2, temp, sommeil)

    prompt = ""
    if historique:
        prompt += "Échanges précédents avec ce colon (contexte, du plus ancien au plus récent) :\n"
        prompt += "\n".join(f"- {ligne}" for ligne in historique)
        prompt += "\n\n"

    prompt += (
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
                "keep_alive": OLLAMA_KEEP_ALIVE,
                "options": {"num_predict": OLLAMA_MAX_TOKENS, "temperature": 0.4},
            },
            timeout=OLLAMA_TIMEOUT,
        )
        response.raise_for_status()
        brut = response.json().get("response", "")
        texte = terminer_proprement(brut)
        if not texte:
            raise ValueError(f"aucune phrase complète (brut : {brut[:120]!r})")
        interdit = _INTERDIT.search(texte)
        if interdit:
            raise ValueError(f"filtre garde-fou sur {interdit.group(0)!r} dans : {texte[:160]!r}")
        if not reponse_acceptable(texte):
            raise ValueError(f"réponse trop longue ({len(texte)} caractères)")

        return {
            "texte": texte,
            "type": _deviner_type(texte),
            "source": "ia",
            "couleur": couleur,
        }

    except (requests.RequestException, ValueError, KeyError) as exc:
        # Mode dégradé : le moteur de règles prend le relais. La raison est
        # journalisée (docker compose logs backend) : sans ça, timeout, filtre
        # et réponse vide se ressemblent tous côté interface.
        logger.warning("IA écartée, mode règles : %s: %s", type(exc).__name__, exc)
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
    # « eau » en mot entier : sinon « beaucoup », « peau »… classent la carte en hydratation.
    if "hydrat" in texte_lower or re.search(r"\beau\b", texte_lower):
        return "hydratation"
    if "repos" in texte_lower or "dorm" in texte_lower or "sommeil" in texte_lower:
        return "repos"
    if "exercic" in texte_lower or "marche" in texte_lower or "sport" in texte_lower:
        return "exercice"
    return "social"
