"""
Catalogue figé des médicaments que l'IA peut prescrire dans le chat (contenu
médical écrit à l'avance, comme les protocoles : le modèle choisit un `id`,
jamais un dosage). Les médicaments à risque ou liés à un protocole d'urgence
(bêta-bloquant, bronchodilatateur, oxygène) ne sont PAS ici : ils ne sortent
que par les protocoles guidés (états rouges).
"""
import json
import pathlib

_FICHIER = pathlib.Path(__file__).parent / "catalogue.json"

CATALOGUE = {e["id"]: e for e in json.loads(_FICHIER.read_text(encoding="utf-8")) if e.get("via_chat")}
