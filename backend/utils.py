import os
import functools
import jwt
from flask import jsonify, request

def token_required(f):
    """Décorateur qui protège une route avec le JWT."""
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "")

        if not token:
            return jsonify({"message": "Token manquant"}), 401

        try:
            payload = jwt.decode(token, os.environ.get("SECRET_KEY", "change_moi"), algorithms=["HS256"])
            request.user_id = payload["user_id"]
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expiré, reconnecte-toi"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Token invalide"}), 401

        return f(*args, **kwargs)
    return decorated