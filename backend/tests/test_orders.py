def _setup_product(client, auth_headers, price=2499):
    cat = client.post("/api/v1/categories", json={"name": "Test Category"}, headers=auth_headers).json()
    product = client.post(
        "/api/v1/products",
        json={"category_id": cat["id"], "name": "Test Product", "price": price, "stock": 20},
        headers=auth_headers,
    ).json()
    return product


def test_order_total_calculated_from_line_items(client, auth_headers):
    product = _setup_product(client, auth_headers, price=2499)
    resp = client.post(
        "/api/v1/orders",
        json={
            "customer_name": "Sara Ahmed", "customer_phone": "03001234567",
            "items": [{"product_id": product["id"], "quantity": 2}],
        },
    )
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert float(body["total_amount"]) == 4998
    assert body["items"][0]["quantity"] == 2


def test_order_price_is_snapshotted_not_live(client, auth_headers):
    """If the product's price changes later, past order totals must not change."""
    product = _setup_product(client, auth_headers, price=1000)
    order = client.post(
        "/api/v1/orders",
        json={"customer_name": "Faiza Khan", "items": [{"product_id": product["id"], "quantity": 1}]},
    ).json()

    client.patch(f"/api/v1/products/{product['id']}", json={"price": 5000}, headers=auth_headers)

    orders = client.get("/api/v1/orders", headers=auth_headers).json()
    fetched = next(o for o in orders if o["id"] == order["id"])
    assert float(fetched["total_amount"]) == 1000


def test_dashboard_revenue_excludes_cancelled_orders(client, auth_headers):
    product = _setup_product(client, auth_headers, price=1000)
    order = client.post(
        "/api/v1/orders",
        json={"customer_name": "Hina Raza", "items": [{"product_id": product["id"], "quantity": 3}]},
    ).json()

    summary_before = client.get("/api/v1/dashboard/summary", headers=auth_headers).json()
    assert float(summary_before["total_revenue"]) == 3000

    client.patch(f"/api/v1/orders/{order['id']}/status", json={"status": "CANCELLED"}, headers=auth_headers)

    summary_after = client.get("/api/v1/dashboard/summary", headers=auth_headers).json()
    assert float(summary_after["total_revenue"]) == 0


def test_dashboard_top_products_ranked_by_revenue(client, auth_headers):
    cheap = _setup_product(client, auth_headers, price=100)
    client.post(
        "/api/v1/orders",
        json={"customer_name": "Zainab", "items": [{"product_id": cheap["id"], "quantity": 50}]},
    )
    summary = client.get("/api/v1/dashboard/summary", headers=auth_headers).json()
    assert summary["top_products"][0]["product_name"] == "Test Product"
    assert float(summary["top_products"][0]["revenue"]) == 5000
