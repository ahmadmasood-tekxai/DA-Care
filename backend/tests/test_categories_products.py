def _create_category(client, auth_headers, name="Wedding Sets"):
    resp = client.post("/api/v1/categories", json={"name": name, "icon": "Gem"}, headers=auth_headers)
    assert resp.status_code == 201, resp.text
    return resp.json()


def _create_product(client, auth_headers, category_id, name="The Little Prince Set", price=2499):
    resp = client.post(
        "/api/v1/products",
        json={
            "category_id": category_id, "name": name, "short_description": "Navy waistcoat set",
            "price": price, "stock": 10,
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


def test_category_slug_auto_generated(client, auth_headers):
    category = _create_category(client, auth_headers, name="Wedding Guest Sets")
    assert category["slug"] == "wedding-guest-sets"


def test_duplicate_category_name_gets_unique_slug(client, auth_headers):
    c1 = _create_category(client, auth_headers, name="Party Sets")
    c2 = _create_category(client, auth_headers, name="Party Sets")
    assert c1["slug"] == "party-sets"
    assert c2["slug"] == "party-sets-2"


def test_public_category_list_includes_product_count(client, auth_headers):
    category = _create_category(client, auth_headers, name="Birthday Sets")
    _create_product(client, auth_headers, category["id"])
    _create_product(client, auth_headers, category["id"], name="The Birthday Bash Set")

    resp = client.get("/api/v1/categories")
    assert resp.status_code == 200
    found = next(c for c in resp.json() if c["slug"] == "birthday-sets")
    assert found["product_count"] == 2


def test_product_detail_by_slug_includes_category(client, auth_headers):
    category = _create_category(client, auth_headers, name="Photoshoot Sets")
    product = _create_product(client, auth_headers, category["id"], name="The Golden Hour Set")

    resp = client.get(f"/api/v1/products/{product['slug']}")
    assert resp.status_code == 200
    body = resp.json()
    assert body["category"]["slug"] == "photoshoot-sets"


def test_product_list_filters_by_category(client, auth_headers):
    cat_a = _create_category(client, auth_headers, name="Category A")
    cat_b = _create_category(client, auth_headers, name="Category B")
    _create_product(client, auth_headers, cat_a["id"], name="Product A1")
    _create_product(client, auth_headers, cat_b["id"], name="Product B1")

    resp = client.get("/api/v1/products", params={"category_slug": "category-a"})
    body = resp.json()
    assert body["total"] == 1
    assert body["items"][0]["name"] == "Product A1"


def test_inactive_products_hidden_from_public_list(client, auth_headers):
    category = _create_category(client, auth_headers)
    product = _create_product(client, auth_headers, category["id"])
    client.patch(f"/api/v1/products/{product['id']}", json={"is_active": False}, headers=auth_headers)

    resp = client.get("/api/v1/products")
    slugs = [p["slug"] for p in resp.json()["items"]]
    assert product["slug"] not in slugs
