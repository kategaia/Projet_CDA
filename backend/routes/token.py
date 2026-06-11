import secrets
from flask import Blueprint, jsonify, request
from extensions import db
from models import Token
from utils import token_required

token_bp = Blueprint("token", __name__, url_prefix="/api/token")

@token_bp.route("/generate", methods=["POST"])
@token_required
def generate_token():
    Token.query.filter_by(user_id=request.user_id).delete()
    valeur = secrets.token_hex(32)
    token  = Token(valeur=valeur, user_id=request.user_id)
    db.session.add(token)
    db.session.commit()
    return jsonify({"success": True, "token": token.to_dict()})

@token_bp.route("", methods=["GET"])
@token_required
def get_token():
    token = Token.query.filter_by(user_id=request.user_id).first()
    if not token:
        return jsonify({"success": False, "message": "Aucun token généré"}), 404
    return jsonify({"success": True, "token": token.to_dict()})