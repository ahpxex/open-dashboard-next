"""Runtime configuration — mirrors the frontend's zero-config posture (CONTRACT §3).

- No ``DATABASE_URL`` → SQLite (a local file ``./app.db``), tables auto-created on
  startup. One install + one run command, no external infra.
- ``DATABASE_URL`` set → Postgres (the production path) via ``psycopg``.
- No ``AUTH_JWT_SECRET`` in dev → a clearly-labelled INSECURE fallback. In
  production (``APP_ENV=production``) the service FAILS CLOSED if the secret is
  unset — exactly like ``src/lib/auth.ts``.
"""

from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

# A clearly-labelled, obviously-insecure dev fallback. Never use in production —
# the service refuses to boot in production without a real secret (see validate()).
INSECURE_DEV_SECRET = "INSECURE-dev-secret-do-not-use-in-production"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # "development" (default) | "production". In production the JWT secret is required.
    app_env: str = "development"

    # When unset → SQLite file. When set → Postgres (use a psycopg URL, e.g.
    # postgresql+psycopg://user:pass@host:5432/db).
    database_url: str | None = None

    # HS256 signing secret for auth JWTs.
    auth_jwt_secret: str | None = None
    # Token lifetime in seconds (default 7 days, matching CONTRACT §2a).
    auth_jwt_ttl_seconds: int = 60 * 60 * 24 * 7

    # Comma-separated list of frontend origins allowed by CORS. "*" allows all.
    cors_origins: str = "http://localhost:3000"

    # Optional bearer token guarding the DATA routes (the /products API). Unset →
    # the data API trusts its network and stays open (zero-config dev). Set →
    # every /products request must carry `Authorization: Bearer <DATA_API_TOKEN>`
    # (CONTRACT §1; auth routes are never gated by this — they have their own auth).
    data_api_token: str | None = None

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"

    @property
    def data_token(self) -> str | None:
        """The effective data-API bearer token, or ``None`` when unset/blank
        (so an empty env value leaves the data routes open, matching dev)."""
        token = (self.data_api_token or "").strip()
        return token or None

    @property
    def sqlalchemy_url(self) -> str:
        """Resolve the effective DB URL. SQLite file when DATABASE_URL is unset."""
        if self.database_url:
            return self.database_url
        return "sqlite:///./app.db"

    @property
    def is_sqlite(self) -> bool:
        return self.sqlalchemy_url.startswith("sqlite")

    @property
    def jwt_secret(self) -> str:
        """The effective signing secret. Falls back to the insecure dev secret in
        development; production callers must have passed validate() first."""
        return self.auth_jwt_secret or INSECURE_DEV_SECRET

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    def validate_runtime(self) -> None:
        """Fail closed in production when the auth secret is unset."""
        if self.is_production and not self.auth_jwt_secret:
            raise RuntimeError(
                "AUTH_JWT_SECRET must be set in production (APP_ENV=production). "
                "Refusing to boot with the insecure dev fallback."
            )


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.validate_runtime()
    return settings
