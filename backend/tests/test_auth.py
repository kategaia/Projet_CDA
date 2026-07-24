import json

def register(client, **kwargs):
    """Helper pour créer un compte."""
    data = {
        "email": "test@voxelbingo.fr",
        "pseudo": "TestUser",
        "pseudo_mc": None,
        "password": "TestPass123",
        **kwargs
    }
    return client.post("/api/register",
        data=json.dumps(data),
        content_type="application/json"
    )

def login(client, identifiant="test@voxelbingo.fr", password="TestPass123"):
    """Helper pour se connecter et récupérer le token JWT."""
    res = client.post("/api/login",
        data=json.dumps({"identifiant": identifiant, "password": password}),
        content_type="application/json"
    )
    return res, json.loads(res.data)


class TestRegister:
    def test_inscription_valide(self, client):
        """Un utilisateur peut créer un compte avec des données valides."""
        res = register(client)
        data = json.loads(res.data)
        assert res.status_code == 200
        assert data["success"] is True
        assert data["message"] == "Compte créé !"

    def test_inscription_email_deja_utilise(self, client):
        """L'inscription échoue si l'email est déjà utilisé."""
        register(client)
        res = register(client)  # même email
        data = json.loads(res.data)
        assert res.status_code == 409
        assert data["success"] is False
        assert "déjà utilisé" in data["message"]

    def test_inscription_champs_manquants(self, client):
        """L'inscription échoue si des champs obligatoires sont manquants."""
        res = client.post("/api/register",
            data=json.dumps({"email": "test@test.fr"}),
            content_type="application/json"
        )
        data = json.loads(res.data)
        assert res.status_code == 400
        assert data["success"] is False


class TestLogin:
    def test_connexion_par_email(self, client):
        """Un utilisateur peut se connecter avec son email."""
        register(client)
        res, data = login(client)
        assert res.status_code == 200
        assert data["success"] is True
        assert "token" in data

    def test_connexion_par_pseudo(self, client):
        """Un utilisateur peut se connecter avec son pseudo."""
        register(client)
        res, data = login(client, identifiant="TestUser")
        assert res.status_code == 200
        assert data["success"] is True
        assert "token" in data

    def test_connexion_mauvais_mot_de_passe(self, client):
        """La connexion échoue avec un mauvais mot de passe."""
        register(client)
        res, data = login(client, password="MauvaisPass")
        assert res.status_code == 401
        assert data["success"] is False

    def test_connexion_utilisateur_inexistant(self, client):
        """La connexion échoue si l'utilisateur n'existe pas."""
        res, data = login(client, identifiant="inexistant@test.fr")
        assert res.status_code == 401
        assert data["success"] is False