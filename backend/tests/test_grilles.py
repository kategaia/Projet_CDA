import json

def get_token(client):
    """Helper : crée un compte et retourne le token JWT."""
    client.post("/api/register",
        data=json.dumps({
            "email": "test@voxelbingo.fr",
            "pseudo": "TestUser",
            "pseudo_mc": None,
            "password": "TestPass123"
        }),
        content_type="application/json"
    )
    res = client.post("/api/login",
        data=json.dumps({"identifiant": "test@voxelbingo.fr", "password": "TestPass123"}),
        content_type="application/json"
    )
    return json.loads(res.data)["token"]

def auth_headers(token):
    """Helper : retourne les headers avec le token JWT."""
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

def make_cases(type="OBTENIR", cible="DIAMOND", quantite=1):
    """Helper : génère 25 cases identiques pour les tests."""
    return [{"type": type, "cible": cible, "quantite": quantite}] * 25


class TestGrilles:
    def test_creer_grille_valide(self, client):
        """Un utilisateur peut créer une grille avec 25 cases."""
        token = get_token(client)
        res = client.post("/api/grilles",
            data=json.dumps({"nom": "TestGrille", "cases": make_cases()}),
            headers=auth_headers(token)
        )
        data = json.loads(res.data)
        assert res.status_code == 201
        assert data["success"] is True
        assert data["grille"]["nom"] == "TestGrille"

    def test_creer_grille_sans_token(self, client):
        """La création échoue sans token JWT."""
        res = client.post("/api/grilles",
            data=json.dumps({"nom": "TestGrille", "cases": make_cases()}),
            content_type="application/json"
        )
        assert res.status_code == 401

    def test_creer_grille_incomplète(self, client):
        """La création échoue si moins de 25 cases sont fournies."""
        token = get_token(client)
        res = client.post("/api/grilles",
            data=json.dumps({"nom": "TestGrille", "cases": make_cases()[:10]}),
            headers=auth_headers(token)
        )
        data = json.loads(res.data)
        assert res.status_code == 400
        assert data["success"] is False

    def test_lister_grilles(self, client):
        """Un utilisateur peut lister ses grilles."""
        token = get_token(client)
        # Crée 2 grilles
        for i in range(2):
            client.post("/api/grilles",
                data=json.dumps({"nom": f"Grille{i}", "cases": make_cases()}),
                headers=auth_headers(token)
            )
        res = client.get("/api/grilles", headers=auth_headers(token))
        data = json.loads(res.data)
        assert res.status_code == 200
        assert data["success"] is True
        assert len(data["grilles"]) == 2

    def test_modifier_grille(self, client):
        """Un utilisateur peut modifier une grille existante."""
        token = get_token(client)
        # Crée une grille
        res = client.post("/api/grilles",
            data=json.dumps({"nom": "Ancienne", "cases": make_cases()}),
            headers=auth_headers(token)
        )
        grille_id = json.loads(res.data)["grille"]["id"]
        # Modifie la grille
        res = client.put(f"/api/grilles/{grille_id}",
            data=json.dumps({"nom": "Nouvelle", "cases": make_cases("TUER", "ZOMBIE", 5)}),
            headers=auth_headers(token)
        )
        data = json.loads(res.data)
        assert res.status_code == 200
        assert data["grille"]["nom"] == "Nouvelle"

    def test_supprimer_grille(self, client):
        """Un utilisateur peut supprimer une grille."""
        token = get_token(client)
        res = client.post("/api/grilles",
            data=json.dumps({"nom": "ASupprimer", "cases": make_cases()}),
            headers=auth_headers(token)
        )
        grille_id = json.loads(res.data)["grille"]["id"]
        res = client.delete(f"/api/grilles/{grille_id}", headers=auth_headers(token))
        data = json.loads(res.data)
        assert res.status_code == 200
        assert data["success"] is True

    def test_acces_grille_autre_utilisateur(self, client):
        """Un utilisateur ne peut pas accéder aux grilles d'un autre."""
        # Utilisateur 1 crée une grille
        token1 = get_token(client)
        res = client.post("/api/grilles",
            data=json.dumps({"nom": "GrillePrivee", "cases": make_cases()}),
            headers=auth_headers(token1)
        )
        grille_id = json.loads(res.data)["grille"]["id"]

        # Utilisateur 2 essaie d'y accéder
        client.post("/api/register",
            data=json.dumps({
                "email": "user2@test.fr",
                "pseudo": "User2",
                "pseudo_mc": None,
                "password": "TestPass123"
            }),
            content_type="application/json"
        )
        res2 = client.post("/api/login",
            data=json.dumps({"identifiant": "user2@test.fr", "password": "TestPass123"}),
            content_type="application/json"
        )
        token2 = json.loads(res2.data)["token"]

        res = client.get(f"/api/grilles/{grille_id}", headers=auth_headers(token2))
        data = json.loads(res.data)
        assert res.status_code == 404