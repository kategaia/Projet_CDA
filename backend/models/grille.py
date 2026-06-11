import datetime
import json
from extensions import db

class Grille(db.Model):
    id         = db.Column(db.Integer, primary_key=True)
    nom        = db.Column(db.String(100), nullable=False)
    cases      = db.Column(db.Text, nullable=False)
    user_id    = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now(datetime.timezone.utc))

    def to_dict(self):
        return {
            "id":         self.id,
            "nom":        self.nom,
            "cases":      json.loads(self.cases),
            "created_at": self.created_at.isoformat(),
        }