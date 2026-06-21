"""SQLAlchemy 2.0 engine, session, and declarative base.

Tables are created automatically on startup (``init_db``) so the zero-config
SQLite path needs no manual migration step (CONTRACT §3).
"""

from __future__ import annotations

from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings


class Base(DeclarativeBase):
    pass


def _make_engine():
    settings = get_settings()
    url = settings.sqlalchemy_url
    if settings.is_sqlite:
        # check_same_thread=False lets the connection be shared across the
        # request threads FastAPI/Starlette use; safe with the session-per-request
        # pattern below.
        return create_engine(
            url, connect_args={"check_same_thread": False}, future=True
        )
    return create_engine(url, pool_pre_ping=True, future=True)


engine = _make_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def init_db() -> None:
    """Create all tables. Idempotent; safe to call on every startup."""
    # Import models so they register on Base.metadata before create_all.
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=engine)


def get_session() -> Iterator[Session]:
    """FastAPI dependency: a session per request, always closed."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
