import os
import datetime
from flask import Blueprint, jsonify, request
from extensions import db, bcrypt
from models import User
import jwt

auth_bp = Blueprint("auth", __name__, url_prefix="/api")


@auth_bp.route("/register", methods=["POST"])
def register():
    data      = request.get_json()
    email     = data.get("email")
    password  = data.get("password")
    pseudo    = data.get("pseudo")
    pseudo_mc = data.get("pseudo_mc")

    if not email or not password or not pseudo:
        return jsonify({"success": False, "message": "Email, mot de passe et pseudo requis"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "message": "Email déjà utilisé"}), 409

    if pseudo_mc and User.query.filter_by(pseudo_mc=pseudo_mc).first():
        return jsonify({"success": False, "message": "Pseudo Minecraft déjà utilisé"}), 409

    hashed = bcrypt.generate_password_hash(password).decode("utf-8")
    db.session.add(User(
        email=email,
        password=hashed,
        pseudo=pseudo,
        pseudo_mc=pseudo_mc or None
    ))
    db.session.commit()
    return jsonify({"success": True, "message": "Compte créé !"})


@auth_bp.route("/login", methods=["POST"])
def login():
    data     = request.get_json()
    identifiant    = data.get("identifiant")
    password = data.get("password")

    if not identifiant or not password:
        return jsonify({"success": False, "message": "Identifiant et mot de passe requis"}), 400

    user = User.query.filter_by(email=identifiant).first()
    if not user:
        user = User.query.filter_by(pseudo=identifiant).first()

    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"success": False, "message": "Identifiant ou mot de passe incorrect"}), 401

    token = jwt.encode(
        {"user_id": user.id, "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24)},
        os.environ.get("SECRET_KEY", "change_moi"),
        algorithm="HS256"
    )
    return jsonify({"success": True, "token": token})