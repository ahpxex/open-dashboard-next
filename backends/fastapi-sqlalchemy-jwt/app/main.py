"""FastAPI application entrypoint.

Wires CORS (exposing ``X-Total-Count`` so a browser hitting the API directly can
read pagination — CONTRACT §1), creates tables on startup for the zero-config
SQLite path (CONTRACT §3), and mounts the auth + products routers.
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db import init_db
from app.routers import auth as auth_router
from app.routers import products as products_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Fail-closed-in-production check runs here (get_settings validates).
    get_settings()
    init_db()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="open-dashboard backend · fastapi-sqlalchemy-jwt", lifespan=lifespan)

    allow_all = "*" in settings.cors_origin_list
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"] if allow_all else settings.cors_origin_list,
        # Credentials cannot be combined with the "*" wildcard origin per the
        # CORS spec; the frontend proxies server-side so it needs neither.
        allow_credentials=not allow_all,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Total-Count"],
    )

    app.include_router(auth_router.router)
    app.include_router(products_router.router)

    @app.get("/health", tags=["meta"])
    def health() -> dict:
        return {"ok": True}

    return app


app = create_app()
