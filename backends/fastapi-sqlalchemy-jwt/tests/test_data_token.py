"""Optional data-API bearer guard (DATA_API_TOKEN, CONTRACT §1).

The other suites run with DATA_API_TOKEN UNSET, proving the data routes stay open
for zero-config dev. This module sets the token (via monkeypatch + a settings
cache reset) and proves the guard: a data request WITHOUT the bearer is 401, and
WITH the correct bearer succeeds. Auth routes are never gated by this token.
"""

from __future__ import annotations

import pytest

from app.config import get_settings
from tests.conftest import make_product

TOKEN = "s3cr3t-data-token"


@pytest.fixture()
def token_env(monkeypatch):
    """Set DATA_API_TOKEN for the duration of a test and reset the cached settings
    both before and after, so neither this test nor its neighbours see a stale
    (cached) Settings instance."""
    monkeypatch.setenv("DATA_API_TOKEN", TOKEN)
    get_settings.cache_clear()
    try:
        yield
    finally:
        get_settings.cache_clear()


def test_data_routes_require_bearer_when_token_set(client, token_env):
    # No Authorization header → 401 with the idiomatic FastAPI error body.
    res = client.get("/products")
    assert res.status_code == 401, res.text
    assert res.json() == {"detail": "Unauthorized"}

    # Wrong token → 401.
    res = client.get("/products", headers={"Authorization": "Bearer wrong-token"})
    assert res.status_code == 401, res.text

    # Item route is gated too (still 401 before we even reach the 404 lookup).
    res = client.get("/products/anything")
    assert res.status_code == 401, res.text

    # Correct bearer → the request goes through (empty list, total 0).
    headers = {"Authorization": f"Bearer {TOKEN}"}
    res = client.get("/products", headers=headers)
    assert res.status_code == 200, res.text
    assert res.json() == []
    assert res.headers["X-Total-Count"] == "0"

    # And a write with the bearer works end-to-end.
    created = client.post("/products", json=make_product(name="Guarded"), headers=headers)
    assert created.status_code == 201, created.text
    assert created.json()["name"] == "Guarded"


def test_auth_routes_are_not_gated_by_data_token(client, token_env):
    # Auth routes have their own auth and must NOT require the data token.
    res = client.post(
        "/auth/register",
        json={"email": "z@example.com", "password": "pw123456", "name": "Zed"},
    )
    assert res.status_code == 201, res.text
    # login likewise needs no data token.
    res = client.post(
        "/auth/login", json={"email": "z@example.com", "password": "pw123456"}
    )
    assert res.status_code == 200, res.text
