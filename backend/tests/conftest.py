import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.constants import UserRole
from app.core.database import Base, get_db
from app.core.security import hash_password
from app.main import app
from app.models.user import User
from app.services import email_service

TEST_DATABASE_URL = "sqlite:///./test_qasim_inventory.db"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def outbox(monkeypatch):
    """Never talk to a real SMTP server in tests — capture every email instead."""
    sent: list[dict] = []

    def fake_send(to, subject, html_body, text_body, *, reply_to=None, raise_on_error=False):
        recipients = [to] if isinstance(to, str) else list(to)
        recipients = [r for r in recipients if r]
        if not recipients:
            return False
        sent.append({"to": recipients, "subject": subject, "html": html_body, "text": text_body})
        return True

    monkeypatch.setattr(email_service, "send_email", fake_send)
    monkeypatch.setattr(email_service.settings, "ADMIN_EMAIL", "store@oqira.example.com")
    return sent


@pytest.fixture(scope="function")
def db_session():
    """Fresh schema for every test function — full isolation, no test order coupling."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client, db_session):
    """Creates an admin directly (public sign-up only ever makes customers)
    and returns ready-to-use Authorization headers."""
    db_session.add(
        User(
            username="admin",
            email="admin@oqira.example.com",
            hashed_password=hash_password("SuperSecret123"),
            full_name="Admin User",
            role=UserRole.ADMIN,
        )
    )
    db_session.commit()
    resp = client.post("/api/v1/auth/login", json={"username": "admin", "password": "SuperSecret123"})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def customer_headers(client):
    """Signs up a storefront customer and returns their Authorization headers."""
    resp = client.post(
        "/api/v1/auth/register",
        json={"email": "Sara@Example.com", "password": "Customer123", "full_name": "Sara Ahmed"},
    )
    assert resp.status_code == 201, resp.text
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}
