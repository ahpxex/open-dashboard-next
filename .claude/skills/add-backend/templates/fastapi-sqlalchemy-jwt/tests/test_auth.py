"""Auth contract tests (CONTRACT §2a, §4.1)."""

from __future__ import annotations


def test_register_login_me_roundtrip(client):
    # register → 201 { token, user }
    res = client.post(
        "/auth/register",
        json={"email": "a@example.com", "password": "pw123456", "name": "Ada"},
    )
    assert res.status_code == 201, res.text
    body = res.json()
    assert body["user"]["email"] == "a@example.com"
    assert body["user"]["name"] == "Ada"
    assert body["user"]["id"]
    assert isinstance(body["token"], str) and body["token"]

    # login → 200 { token, user }
    res = client.post(
        "/auth/login", json={"email": "a@example.com", "password": "pw123456"}
    )
    assert res.status_code == 200, res.text
    token = res.json()["token"]

    # GET /auth/me with the bearer token → the user
    res = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200, res.text
    me = res.json()
    assert me["email"] == "a@example.com"
    assert me["name"] == "Ada"


def test_register_duplicate_email_conflicts(client):
    payload = {"email": "dup@example.com", "password": "pw123456", "name": "Dup"}
    assert client.post("/auth/register", json=payload).status_code == 201
    assert client.post("/auth/register", json=payload).status_code == 409


def test_login_bad_credentials_401(client):
    client.post(
        "/auth/register",
        json={"email": "b@example.com", "password": "right-pw", "name": "Bob"},
    )
    res = client.post(
        "/auth/login", json={"email": "b@example.com", "password": "wrong-pw"}
    )
    assert res.status_code == 401


def test_me_without_token_401(client):
    assert client.get("/auth/me").status_code == 401


def test_me_with_garbage_token_401(client):
    res = client.get("/auth/me", headers={"Authorization": "Bearer not-a-jwt"})
    assert res.status_code == 401


def test_password_is_hashed_not_plaintext(client):
    """Defense in depth: the stored hash must not equal the plaintext password."""
    from app.auth import hash_password, verify_password

    digest = hash_password("secret-pw")
    assert digest != "secret-pw"
    assert verify_password("secret-pw", digest)
    assert not verify_password("other-pw", digest)


def test_logout_ok(client):
    res = client.post("/auth/logout")
    assert res.status_code == 200
    assert res.json() == {"ok": True}


def test_register_rejects_invalid_email(client):
    res = client.post(
        "/auth/register",
        json={"email": "not-an-email", "password": "pw", "name": "X"},
    )
    assert res.status_code == 422
