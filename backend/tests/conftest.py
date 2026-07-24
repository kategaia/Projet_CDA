import pytest
from app import create_app
from extensions import db as _db

@pytest.fixture(scope="session")
def app():
    """Crée une instance de l'app Flask configurée pour les tests."""
    app = create_app()
    app.config.update({
        "TESTING": True,
        # BDD SQLite en mémoire — repart de zéro à chaque session de tests
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "SECRET_KEY": "test_secret_key",
    })

    with app.app_context():
        _db.create_all()
        yield app
        _db.drop_all()

@pytest.fixture(scope="function")
def client(app):
    """Client HTTP de test Flask."""
    return app.test_client()

@pytest.fixture(scope="function", autouse=True)
def clean_db(app):
    """Vide les tables avant chaque test pour isoler les tests entre eux."""
    with app.app_context():
        yield
        _db.session.rollback()
        for table in reversed(_db.metadata.sorted_tables):
            _db.session.execute(table.delete())
        _db.session.commit()