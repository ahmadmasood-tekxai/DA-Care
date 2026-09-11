def test_register_and_login(client):
    resp = client.post(
        "/api/v1/auth/register",
        json={"username": "shopowner", "email": "owner@dababycare.example.com", "password": "MyPass123"},
    )
    assert resp.status_code == 201
    login = client.post("/api/v1/auth/login", json={"username": "shopowner", "password": "MyPass123"})
    assert login.status_code == 200
    assert "access_token" in login.json()


def test_admin_route_requires_auth(client):
    resp = client.post("/api/v1/categories", json={"name": "Wedding Sets"})
    assert resp.status_code == 401
