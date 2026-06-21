"""Pytest fixtures — stand the real service up against an isolated in-memory DB.

No mocks of the transport: the tests drive the actual FastAPI app via httpx's
ASGITransport, with the ``get_session`` dependency overridden to a fresh
in-memory SQLite engine (StaticPool so every connection shares one DB). This
keeps the test run zero-config and isolated from any local ``app.db``.
"""

from __future__ import annotations

import os
from collections.abc import Iterator

# Ensure the fail-closed production guard never trips during tests, and pin a
# deterministic secret before any app module reads settings.
os.environ.setdefault("APP_ENV", "development")
os.environ.setdefault("AUTH_JWT_SECRET", "test-secret")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import Base, get_session
from app.main import app


@pytest.fixture()
def client() -> Iterator[TestClient]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

    def override_get_session() -> Iterator[Session]:
        session = TestingSession()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_session] = override_get_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


def make_product(**overrides) -> dict:
    base = {
        "name": "Widget",
        "sku": "SKU-1",
        "category": "tools",
        "price": 9.99,
        "stock": 5,
        "status": "available",
        "description": "a widget",
    }
    base.update(overrides)
    return base
