import json
from flask import Blueprint, jsonify, request
from extensions import db
from models import Grille
from utils import token_required

grilles_bp = Blueprint("grilles", __name__, url_prefix="/api/grilles")

@grilles_bp.route("", methods=["GET"])
@token_required
def liste_grilles():
    grilles = Grille.query.filter_by(user_id=request.user_id).order_by(Grille.created_at.desc()).all()
    return jsonify({"success": True, "grilles": [g.to_dict() for g in grilles]})

@grilles_bp.route("", methods=["POST"])
@token_required
def creer_grille():
    data = request.get_json()
    nom, cases = data.get("nom"), data.get("cases")
    if not nom or not cases or len(cases) != 25:
        return jsonify({"success": False, "message": "Nom et 25 cases requis"}), 400
    grille = Grille(nom=nom, cases=json.dumps(cases), user_id=request.user_id)
    db.session.add(grille)
    db.session.commit()
    return jsonify({"success": True, "grille": grille.to_dict()}), 201

@grilles_bp.route("/<int:grille_id>", methods=["GET"])
@token_required
def get_grille(grille_id):
    grille = Grille.query.filter_by(id=grille_id, user_id=request.user_id).first()
    if not grille:
        return jsonify({"success": False, "message": "Grille introuvable"}), 404
    return jsonify({"success": True, "grille": grille.to_dict()})

@grilles_bp.route("/<int:grille_id>", methods=["PUT"])
@token_required
def modifier_grille(grille_id):
    grille = Grille.query.filter_by(id=grille_id, user_id=request.user_id).first()
    if not grille:
        return jsonify({"success": False, "message": "Grille introuvable"}), 404
    data = request.get_json()
    if "nom" in data:
        grille.nom = data["nom"]
    if "cases" in data and len(data["cases"]) == 25:
        grille.cases = json.dumps(data["cases"])
    db.session.commit()
    return jsonify({"success": True, "grille": grille.to_dict()})

@grilles_bp.route("/<int:grille_id>", methods=["DELETE"])
@token_required
def supprimer_grille(grille_id):
    grille = Grille.query.filter_by(id=grille_id, user_id=request.user_id).first()
    if not grille:
        return jsonify({"success": False, "message": "Grille introuvable"}), 404
    db.session.delete(grille)
    db.session.commit()
    return jsonify({"success": True, "message": "Grille supprimée"})