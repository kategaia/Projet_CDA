import os
from flask import Blueprint, request, jsonify
from extensions import db
from models import User
from utils import token_required

profil_bp = Blueprint("profil", __name__, url_prefix="/api/profil")

@profil_bp.route("", methods=["GET"])
@token_required
def get_profil():
    user = User.query.get(request.user_id)

    if not user:
        return jsonify({"success": False, "message": "Utilisateur introuvable"}), 404
    
    return jsonify({
        "success": True,
        "user": {
            "id": user.id,
            "email": user.email,
            "pseudo": user.pseudo,
            "pseudo_mc": user.pseudo_mc,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }
    })

@profil_bp.route("", methods=["PUT"])
@token_required
def update_profil():
    user = User.query.get(request.user_id)
    data = request.get_json()

    if "pseudo" in data and data["pseudo"]:
        user.pseudo = data["pseudo"]
    if "pseudo_mc" in data and data["pseudo_mc"]:
        user.pseudo_mc = data["pseudo_mc"] or None
    if "email" in data and data["email"]: 
        email_existant = User.query.filter(User.email == data["email"], User.id != request.user_id).first()
        if email_existant:
            return jsonify({"success": False, "message": "Email déjà utilisé !"}), 409
        user.email = data["email"]

    db.session.commit()
    return jsonify({"success": True, "message": "Profil mis à jour !"})