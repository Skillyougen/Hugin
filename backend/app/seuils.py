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
    Moteur de secours si Ollama ne répond pas, ET liste des thèmes des cartes.
    Renvoie toujours les 5 cartes du cahier des charges (repos, respiration,
    exercice, hydratation, activité sociale). Celles liées à une constante hors
    norme viennent en premier ; les autres restent des conseils de fond. Chaque
    texte cite une constante (exigence du cahier des charges).
    """
    couleur, score, details = evaluer_mesure(fc, spo2, temp, sommeil)
    tout_normal = score == 0

    # (type, constante concernée hors norme ?, texte si hors norme, texte de fond)
    cartes = [
        ("repos", details["sommeil"] >= 1,
         f"Ton sommeil de la nuit a été de {sommeil:.1f}h, en dessous du seuil recommandé. "
         f"Essaie de prévoir un temps de repos supplémentaire aujourd'hui.",
         f"Tu as dormi {sommeil:.1f}h cette nuit : garde un rythme de repos régulier ce soir."),
        ("respiration", details["frequence_cardiaque"] >= 1,
         f"Ta fréquence cardiaque est actuellement à {fc:.0f} bpm, hors de ta normale. "
         f"Un exercice de respiration de quelques minutes peut aider à la faire redescendre.",
         f"Avec {fc:.0f} bpm au repos, un court exercice de respiration calme fait toujours du bien."),
        ("exercice", details["spo2"] >= 1,
         f"Ta saturation en oxygène est à {spo2:.0f}%, un peu basse. "
         f"Évite les efforts intenses et signale-le si cela persiste.",
         f"Ta saturation est à {spo2:.0f}% : quelques étirements ou une marche légère te feront du bien."),
        ("hydratation", details["temperature"] >= 1 or score >= 1,
         f"Ta température est à {temp:.1f}°C, hors de ta plage habituelle. "
         f"Pense à bien t'hydrater et surveille l'évolution.",
         f"Ta température est à {temp:.1f}°C : pense à boire de l'eau régulièrement aujourd'hui."),
        ("social", tout_normal,
         "Tes constantes sont dans les normes. C'est un bon moment pour garder le lien "
         "avec le reste de l'équipage.",
         f"Prends un moment pour échanger avec un membre de l'équipage : garder le lien aide "
         f"à tenir sur la durée (FC {fc:.0f} bpm)."),
    ]
    prioritaires = [c for c in cartes if c[1]]
    autres = [c for c in cartes if not c[1]]
    return [
        {"type": t, "texte": texte_alerte if anormal else texte_fond}
        for t, anormal, texte_alerte, texte_fond in prioritaires + autres
    ]
