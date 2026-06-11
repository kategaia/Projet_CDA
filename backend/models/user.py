from extensions import db
import datetime

class User(db.Model):
    id       = db.Column(db.Integer, primary_key=True)
    email    = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    pseudo      = db.Column(db.String(50), nullable=True)
    pseudo_mc   = db.Column(db.String(16), nullable=True)  # max 16 car. pour un pseudo MC
    created_at  = db.Column(db.DateTime, default=datetime.datetime.now(datetime.timezone.utc))

    grilles = db.relationship("Grille", backref="owner", lazy=True, cascade="all, delete-orphan")
    tokens  = db.relationship("Token",  backref="owner", lazy=True, cascade="all, delete-orphan")