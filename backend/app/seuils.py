"""
Seuils simplifiés pour le prototype. A ajuster avec le Bloc 1 (simulateur)
et si possible avec un avis médical rapide avant la démo.

Niveaux : 0 = vert, 1 = orange, 2 = rouge
"""


def niveau_fc(fc: float) -> int:
    if fc < 40 or fc > 120:
        return 2
    if fc < 50 or fc > 100:
        return 1
    return 0


def niveau_spo2(spo2: float) -> int:
    if spo2 < 90:
        return 2
    if spo2 < 95:
        return 1
    return 0


def niveau_temperature(temp: float) -> int:
    if temp < 35.5 or temp > 38.5:
        return 2
    if temp < 36.1 or temp > 37.5:
        return 1
    return 0


def niveau_sommeil(heures: float) -> int:
    if heures < 4:
        return 2
    if heures < 6:
        return 1
    return 0


COULEURS = {0: "vert", 1: "orange", 2: "rouge"}


def evaluer_mesure(fc: float, spo2: float, temp: float, sommeil: float):
    """Retourne (couleur, score, détail par constante)."""
    details = {
        "frequence_cardiaque": niveau_fc(fc),
        "spo2": niveau_spo2(spo2),
        "temperature": niveau_temperature(temp),
        "sommeil": niveau_sommeil(sommeil),
    }
    score = max(details.values())
    return COULEURS[score], score, details


def recommandations_regles(fc: float, spo2: float, temp: float, sommeil: float) -> list[dict]:
    """
    Moteur de secours si Ollama ne répond pas.
    Génère des recommandations simples basées sur les seuils dépassés,
    en citant toujours la constante concernée (exigence du cahier des charges).
    """
    couleur, score, details = evaluer_mesure(fc, spo2, temp, sommeil)
    recos = []

    if details["sommeil"] >= 1:
        recos.append({
            "type": "repos",
            "texte": f"Ton sommeil de la nuit a été de {sommeil:.1f}h, en dessous du seuil recommandé. "
                     f"Essaie de prévoir un temps de repos supplémentaire aujourd'hui.",
        })
    if details["frequence_cardiaque"] >= 1:
        recos.append({
            "type": "respiration",
            "texte": f"Ta fréquence cardiaque est actuellement à {fc:.0f} bpm, au-dessus de ta normale. "
                     f"Un exercice de respiration de quelques minutes peut aider à la faire redescendre.",
        })
    if details["spo2"] >= 1:
        recos.append({
            "type": "exercice",
            "texte": f"Ta saturation en oxygène est à {spo2:.0f}%, un peu basse. "
                     f"Évite les efforts intenses et signale-le si cela persiste.",
        })
    if details["temperature"] >= 1:
        recos.append({
            "type": "hydratation",
            "texte": f"Ta température est à {temp:.1f}°C, hors de ta plage habituelle. "
                     f"Pense à bien t'hydrater et surveille l'évolution.",
        })
    if score >= 1 and not any(r["type"] == "hydratation" for r in recos):
        recos.append({
            "type": "hydratation",
            "texte": f"Avec une température de {temp:.1f}°C, pense à boire de l'eau régulièrement aujourd'hui.",
        })
    if not recos:
        recos.append({
            "type": "social",
            "texte": "Tes constantes sont dans les normes. C'est un bon moment pour garder le lien "
                     "avec le reste de l'équipage.",
        })

    return recos
