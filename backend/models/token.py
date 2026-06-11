import datetime
from extensions import db

class Token(db.Model):
    id         = db.Column(db.Integer, primary_key=True)
    valeur     = db.Column(db.String(64), unique=True, nullable=False)
    user_id    = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now(datetime.timezone.utc))

    def to_dict(self):
        return {
            "id":         self.id,
            "valeur":     self.valeur,
            "created_at": self.created_at.isoformat(),
        }