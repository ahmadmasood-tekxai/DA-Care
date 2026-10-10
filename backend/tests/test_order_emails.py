"""Order emails: confirmation on checkout, follow-ups on every status change."""
from datetime import datetime, timezone
from decimal import Decimal

from app.constants import OrderStatus, PaymentMethod, PaymentStatus
from app.services.email_service import EmailLine, OrderEmail, render_order_email, should_alert_low_stock


def _product(client, auth_headers, price=1500, stock=20):
    cat = client.post("/api/v1/categories", json={"name": "Jewellery"}, headers=auth_headers).json()
    return client.post(
        "/api/v1/products",
        json={"category_id": cat["id"], "name": "Pearl Earrings", "price": price, "stock": stock},
        headers=auth_headers,
    ).json()


def _order(client, product, headers=None, **extra):
    payload = {
        "customer_name": "Sara Ahmed",
        "customer_phone": "03001234567",
        "customer_address": "House 1, Street 2, Lahore",
        "items": [{"product_id": product["id"], "quantity": 2}],
        **extra,
    }
    resp = client.post("/api/v1/orders", json=payload, headers=headers or {})
    assert resp.status_code == 201, resp.text
    return resp.json()


def _subjects_to(outbox, address):
    return [m["subject"] for m in outbox if address in m["to"]]


def test_cod_order_emails_customer_and_store(client, auth_headers, outbox):
    product = _product(client, auth_headers)
    order = _order(client, product, customer_email="sara@example.com")

    assert order["customer_email"] == "sara@example.com"
    customer = [m for m in outbox if m["to"] == ["sara@example.com"]]
    store = [m for m in outbox if m["to"] == ["store@oqira.example.com"]]
    assert len(customer) == 1 and len(store) == 1
    assert f"#{order['id']}" in customer[0]["subject"]
    assert "Rs. 3,000" in customer[0]["html"]
    assert "Pearl Earrings" in customer[0]["text"]
    assert store[0]["subject"].startswith(f"New order #{order['id']}")


def test_guest_without_email_still_alerts_store(client, auth_headers, outbox):
    product = _product(client, auth_headers)
    _order(client, product)
    assert [m["to"] for m in outbox] == [["store@oqira.example.com"]]


def test_signed_in_checkout_links_account_and_uses_account_email(client, auth_headers, customer_headers, outbox):
    product = _product(client, auth_headers)
    order = _order(client, product, headers=customer_headers)
    assert order["customer_email"] == "sara@example.com"
    assert order["created_by_id"] is not None

    mine = client.get("/api/v1/orders/mine", headers=customer_headers).json()
    assert [o["id"] for o in mine] == [order["id"]]

    users = client.get("/api/v1/users", headers=auth_headers).json()
    sara = next(u for u in users if u["email"] == "sara@example.com")
    assert sara["orders_count"] == 1
    assert Decimal(str(sara["total_spent"])) == Decimal("3000")
    assert sara["phone"] == "03001234567"


def test_status_changes_send_follow_ups(client, auth_headers, outbox):
    product = _product(client, auth_headers)
    order = _order(client, product, customer_email="sara@example.com")
    outbox.clear()

    for new_status in ("CONFIRMED", "SHIPPED", "DELIVERED"):
        resp = client.patch(f"/api/v1/orders/{order['id']}/status", json={"status": new_status}, headers=auth_headers)
        assert resp.status_code == 200

    subjects = _subjects_to(outbox, "sara@example.com")
    assert subjects == [
        f"Your order #{order['id']} is confirmed",
        f"Your order #{order['id']} is on its way",
        f"Delivered: order #{order['id']} — how did we do?",
    ]
    # Setting the same status again doesn't spam the customer.
    client.patch(f"/api/v1/orders/{order['id']}/status", json={"status": "DELIVERED"}, headers=auth_headers)
    assert len(_subjects_to(outbox, "sara@example.com")) == 3


def test_bank_transfer_flow_emails(client, auth_headers, outbox):
    product = _product(client, auth_headers)
    order = _order(client, product, customer_email="sara@example.com", payment_method="BANK_TRANSFER")
    assert _subjects_to(outbox, "sara@example.com") == [f"Complete your payment for order #{order['id']}"]

    client.post(f"/api/v1/orders/{order['id']}/mark-transferred", data={"transaction_ref": "TX123"})
    assert any("Verify payment" in s for s in _subjects_to(outbox, "store@oqira.example.com"))

    client.post(f"/api/v1/orders/{order['id']}/verify-payment", json={"action": "reject"}, headers=auth_headers)
    assert "Action needed" in _subjects_to(outbox, "sara@example.com")[-1]

    client.post(f"/api/v1/orders/{order['id']}/mark-transferred", data={"transaction_ref": "TX124"})
    client.post(f"/api/v1/orders/{order['id']}/verify-payment", json={"action": "confirm"}, headers=auth_headers)
    assert _subjects_to(outbox, "sara@example.com")[-1].startswith("Payment confirmed")


def test_admin_follow_up_resends_current_state(client, auth_headers, outbox):
    product = _product(client, auth_headers)
    order = _order(client, product, customer_email="sara@example.com", payment_method="BANK_TRANSFER")
    outbox.clear()
    resp = client.post(f"/api/v1/orders/{order['id']}/follow-up", headers=auth_headers)
    assert resp.status_code == 200
    assert _subjects_to(outbox, "sara@example.com") == [f"Complete your payment for order #{order['id']}"]


def test_follow_up_requires_customer_email(client, auth_headers):
    product = _product(client, auth_headers)
    order = _order(client, product)
    assert client.post(f"/api/v1/orders/{order['id']}/follow-up", headers=auth_headers).status_code == 400


def test_low_stock_alert_fires_once_when_crossing_threshold(client, auth_headers, outbox):
    product = _product(client, auth_headers, stock=7)
    _order(client, product)  # 7 -> 5: crosses the threshold
    _order(client, product)  # 5 -> 3: already low, no repeat alert
    alerts = [s for s in _subjects_to(outbox, "store@oqira.example.com") if s.startswith("Low stock")]
    assert alerts == ["Low stock: Pearl Earrings (only 5 left)"]
    assert should_alert_low_stock(1, 0)  # selling out alerts again


def test_customer_text_is_html_escaped():
    order = OrderEmail(
        id=7, customer_name="<script>alert(1)</script>", customer_email="x@example.com", customer_phone="0300",
        customer_address="<b>Lahore</b>", note="", status=OrderStatus.PENDING,
        payment_method=PaymentMethod.CASH_ON_DELIVERY, payment_status=PaymentStatus.UNPAID,
        items=(EmailLine("Ring <i>", 1, Decimal("999")),), created_at=datetime.now(timezone.utc),
    )
    _, html_body, _ = render_order_email(order, "received")
    assert "<script>" not in html_body and "&lt;script&gt;" in html_body
    assert "<b>Lahore</b>" not in html_body
