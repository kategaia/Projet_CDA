import json

def setup_user_with_token(client):
    """Helper : crée un compte, une grille et génère un token plugin."""
    # Inscription
    client.post("/api/register",
        data=json.dumps({
            "email": "test@voxelbingo.fr",
            "pseudo": "TestUser",
            "pseudo_mc": None,
            "password": "TestPass123"
        }),
        content_type="application/json"
    )
    # Connexion
    res = client.post("/api/login",
        data=json.dumps({"identifiant": "test@voxelbingo.fr", "password": "TestPass123"}),
        content_type="application/json"
    )
    jwt_token = json.loads(res.data)["token"]
    headers = {"Authorization": f"Bearer {jwt_token}", "Content-Type": "application/json"}

    # Crée une grille
    client.post("/api/grilles",
        data=json.dumps({
            "nom": "GrillePlugin",
            "cases": [{"type": "OBTENIR", "cible": "DIAMOND", "quantite": 1}] * 25
        }),
        headers=headers
    )

    # Génère un token plugin
    res = client.post("/api/token/generate", headers=headers)
    plugin_token = json.loads(res.data)["token"]["valeur"]

    return plugin_token


class TestPlugin:
    def test_recuperer_grilles_token_valide(self, client):
        """Le plugin peut récupérer les grilles avec un token valide."""
        plugin_token = setup_user_with_token(client)
        res = client.get("/api/plugin/grilles",
            headers={"X-Plugin-Token": plugin_token}
        )
        data = json.loads(res.data)
        assert res.status_code == 200
        assert data["success"] is True
        assert len(data["grilles"]) == 1
        assert data["grilles"][0]["nom"] == "GrillePlugin"

    def test_recuperer_grilles_token_invalide(self, client):
        """Le plugin est refusé avec un token invalide."""
        res = client.get("/api/plugin/grilles",
            headers={"X-Plugin-Token": "token_bidon_invalide"}
        )
        data = json.loads(res.data)
        assert res.status_code == 401
        assert data["success"] is False

    def test_recuperer_grilles_sans_token(self, client):
        """Le plugin est refusé sans token."""
        res = client.get("/api/plugin/grilles")
        data = json.loads(res.data)
        assert res.status_code == 401
        assert data["success"] is False

    def test_format_cases_json(self, client):
        """Les cases retournées sont bien au format JSON structuré."""
        plugin_token = setup_user_with_token(client)
        res = client.get("/api/plugin/grilles",
            headers={"X-Plugin-Token": plugin_token}
        )
        data = json.loads(res.data)
        case = data["grilles"][0]["cases"][0]
        assert "type" in case
        assert "cible" in case
        assert "quantite" in case
        assert case["type"] == "OBTENIR"
        assert case["cible"] == "DIAMOND"