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


def test_public_signup_cannot_create_an_admin(client):
    resp = client.post(
        "/api/v1/auth/register",
        json={"email": "sneaky@example.com", "password": "Sneaky1234", "role": "ADMIN"},
    )
    assert resp.status_code == 201
    assert resp.json()["user"]["role"] == "CUSTOMER"


def test_signup_signs_in_and_sends_welcome_email(client, outbox):
    resp = client.post(
        "/api/v1/auth/register",
        json={"email": "Hina@Example.com", "password": "Welcome123", "full_name": "Hina Raza"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["access_token"]
    assert body["user"]["email"] == "hina@example.com"
    assert body["user"]["username"] == "hina"
    assert [m["to"] for m in outbox] == [["hina@example.com"]]
    assert "Welcome" in outbox[0]["subject"]


def test_duplicate_email_rejected(client):
    payload = {"email": "dup@example.com", "password": "Password123"}
    assert client.post("/api/v1/auth/register", json=payload).status_code == 201
    assert client.post("/api/v1/auth/register", json={**payload, "email": "DUP@example.com"}).status_code == 409


def test_login_with_email_case_insensitive(client, customer_headers):
    resp = client.post("/api/v1/auth/login", json={"username": "SARA@example.com", "password": "Customer123"})
    assert resp.status_code == 200
    assert resp.json()["user"]["full_name"] == "Sara Ahmed"


def test_customer_cannot_use_admin_endpoints(client, customer_headers):
    assert client.post("/api/v1/categories", json={"name": "X"}, headers=customer_headers).status_code == 403
    assert client.get("/api/v1/orders", headers=customer_headers).status_code == 403
    assert client.get("/api/v1/dashboard/summary", headers=customer_headers).status_code == 403
    assert client.get("/api/v1/users", headers=customer_headers).status_code == 403


def test_update_profile_and_password(client, customer_headers):
    resp = client.patch(
        "/api/v1/auth/me", json={"full_name": "Sara A.", "phone": "03001234567"}, headers=customer_headers
    )
    assert resp.status_code == 200
    assert resp.json()["phone"] == "03001234567"

    wrong = client.patch(
        "/api/v1/auth/me", json={"current_password": "nope", "new_password": "NewPass123"}, headers=customer_headers
    )
    assert wrong.status_code == 400

    ok = client.patch(
        "/api/v1/auth/me", json={"current_password": "Customer123", "new_password": "NewPass123"}, headers=customer_headers
    )
    assert ok.status_code == 200
    assert client.post("/api/v1/auth/login", json={"username": "sara@example.com", "password": "NewPass123"}).status_code == 200


def test_admin_lists_users_and_deactivates_customer(client, auth_headers, customer_headers):
    users = client.get("/api/v1/users", headers=auth_headers).json()
    customer = next(u for u in users if u["role"] == "CUSTOMER")
    assert customer["orders_count"] == 0

    resp = client.patch(f"/api/v1/users/{customer['id']}", json={"is_active": False}, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["is_active"] is False
    # A disabled account's token stops working immediately.
    assert client.get("/api/v1/auth/me", headers=customer_headers).status_code == 401


def test_admin_cannot_deactivate_self(client, auth_headers):
    me = client.get("/api/v1/auth/me", headers=auth_headers).json()
    resp = client.patch(f"/api/v1/users/{me['id']}", json={"is_active": False}, headers=auth_headers)
    assert resp.status_code == 400


def test_admin_creates_staff_who_can_manage_catalogue(client, auth_headers):
    resp = client.post(
        "/api/v1/users",
        json={"username": "packer", "email": "packer@example.com", "password": "Packer1234", "role": "STAFF"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    token = client.post("/api/v1/auth/login", json={"username": "packer", "password": "Packer1234"}).json()["access_token"]
    staff = {"Authorization": f"Bearer {token}"}
    assert client.post("/api/v1/categories", json={"name": "Rings"}, headers=staff).status_code == 201
    # Staff can't manage accounts — that's admin-only.
    assert client.get("/api/v1/users", headers=staff).status_code == 403
