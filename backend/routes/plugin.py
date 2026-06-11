from flask import Blueprint, jsonify, request
from models import Token, Grille

plugin_bp = Blueprint("plugin", __name__, url_prefix="/api/plugin")

@plugin_bp.route("/grilles", methods=["GET"])
def get_grilles_plugin():
    """Le plugin Minecraft envoie son token dans le header X-Plugin-Token."""
    valeur = request.headers.get("X-Plugin-Token")
    if not valeur:
        return jsonify({"success": False, "message": "Token manquant"}), 401
    token = Token.query.filter_by(valeur=valeur).first()
    if not token:
        return jsonify({"success": False, "message": "Token invalide"}), 401
    grilles = Grille.query.filter_by(user_id=token.user_id).all()
    return jsonify({"success": True, "grilles": [g.to_dict() for g in grilles]})