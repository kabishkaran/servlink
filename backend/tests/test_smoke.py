"""
Lightweight smoke tests for the critical paths: auth, the two AI endpoints,
and the full booking lifecycle. Not a full test suite — runs against the
same database configured in .env (so `alembic upgrade head` and `seed.py`
must have been run first, since these tests rely on seeded categories).
Every test creates its own throwaway users/listings and tears them down
afterward so the seeded demo data is never touched.
"""
import uuid

import pytest
from fastapi.testclient import TestClient

from app.database import SessionLocal
from app.main import app
from app.models import Booking, Listing, Provider, User

client = TestClient(app)


@pytest.fixture
def db():
    session = SessionLocal()
    yield session
    session.close()


def unique_email():
    return f"smoketest_{uuid.uuid4().hex[:8]}@example.com"


def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_register_and_login(db):
    email = unique_email()
    res = client.post("/api/auth/register", json={
        "email": email, "password": "testpass123", "name": "Smoke Test", "role": "customer",
    })
    assert res.status_code == 201
    token = res.json()["access_token"]

    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["email"] == email

    res = client.post("/api/auth/login", json={"email": email, "password": "wrongpassword"})
    assert res.status_code == 401

    res = client.post("/api/auth/login", json={"email": email, "password": "testpass123"})
    assert res.status_code == 200

    db.query(User).filter(User.email == email).delete()
    db.commit()


def test_ai_classify_and_recommend():
    res = client.post("/api/ai/classify", json={"text": "need someone to fix a leaking pipe"})
    assert res.status_code == 200
    assert res.json()["category"] == "plumber"

    res = client.get("/api/ai/recommend", params={"category": "movers"})
    assert res.status_code == 200
    suggested = [s["category"] for s in res.json()["suggestions"]]
    assert "house-rental" in suggested


def test_booking_lifecycle(db):
    customer_email = unique_email()
    provider_email = unique_email()

    res = client.post("/api/auth/register", json={
        "email": customer_email, "password": "testpass123", "name": "Smoke Customer", "role": "customer",
    })
    customer_token = res.json()["access_token"]

    res = client.post("/api/auth/register", json={
        "email": provider_email, "password": "testpass123", "name": "Smoke Provider", "role": "provider",
    })
    provider_token = res.json()["access_token"]

    res = client.post("/api/providers/register", data={
        "business_name": "Smoke Test Plumbing",
        "category_slug": "plumber",
        "description": "test",
        "service_area": "Colombo",
        "pricing_model": "hourly",
    }, headers={"Authorization": f"Bearer {provider_token}"})
    assert res.status_code == 201

    res = client.post("/api/listings", json={
        "title": "Smoke test listing", "description": "test",
        "price": 1000, "unit": "hour", "location": "Colombo",
    }, headers={"Authorization": f"Bearer {provider_token}"})
    assert res.status_code == 201
    listing_id = res.json()["id"]

    res = client.post("/api/bookings", json={
        "listing_id": listing_id, "booking_date": "2027-01-01",
        "time_slot": "9:00 AM", "notes": "smoke test",
    }, headers={"Authorization": f"Bearer {customer_token}"})
    assert res.status_code == 201
    booking_id = res.json()["id"]
    assert res.json()["status"] == "pending"

    # customer cannot skip straight to completed
    res = client.patch(f"/api/bookings/{booking_id}", json={"status": "completed"},
                        headers={"Authorization": f"Bearer {customer_token}"})
    assert res.status_code == 400

    res = client.patch(f"/api/bookings/{booking_id}", json={"status": "confirmed"},
                        headers={"Authorization": f"Bearer {provider_token}"})
    assert res.status_code == 200
    assert res.json()["status"] == "confirmed"

    db.query(Booking).filter(Booking.id == booking_id).delete()
    db.query(Listing).filter(Listing.id == listing_id).delete()
    db.query(Provider).filter(Provider.business_name == "Smoke Test Plumbing").delete()
    db.query(User).filter(User.email.in_([customer_email, provider_email])).delete(synchronize_session=False)
    db.commit()
