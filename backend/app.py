import os
from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from flask_cors import CORS
from extensions import db, bcrypt
from routes.auth import auth_bp
from routes.grilles import grilles_bp
from routes.plugin import plugin_bp
from routes.token import token_bp
from routes.profil import profil_bp


def create_app():
    """Factory pattern — crée et configure l'app Flask."""
    app = Flask(__name__)
    CORS(app)

    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "change_moi")
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_pre_ping": True  # vérifie la connexion avant chaque requête
    }

    # Lie les extensions à l'app
    db.init_app(app)
    bcrypt.init_app(app)

    # Enregistre les blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(grilles_bp)
    app.register_blueprint(plugin_bp)
    app.register_blueprint(token_bp)
    app.register_blueprint(profil_bp)

    # Crée les tables si elles n'existent pas
    with app.app_context():
        import models  # noqa: F401
        db.create_all()

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)