"""Custom JWT auth primitives (CONTRACT §2a).

- Passwords hashed with bcrypt via passlib — never stored or compared in plaintext.
- Stateless HS256 JWTs via PyJWT. Claims: ``sub`` (user id), ``email``, ``name``,
  ``iat``, ``exp`` (default 7 days). Secret from ``AUTH_JWT_SECRET`` with an
  insecure dev fallback (fail-closed in production — see ``config.py``).
- ``current_user`` is the FastAPI dependency that powers ``GET /auth/me`` and any
  bearer-guarded route: it reads ``Authorization: Bearer <token>``, validates the
  JWT, and loads the user (401 on any failure).
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import get_session
from app.models import User

JWT_ALGORITHM = "HS256"

# bcrypt has a 72-byte input limit; passlib truncates by default (truncate_error
# left False) so long passwords are accepted rather than erroring.
_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# auto_error=False so we can raise our own 401 with a consistent body.
_bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return _pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return _pwd_context.verify(password, password_hash)
    except ValueError:
        return False


def create_token(user: User) -> str:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user.id,
        "email": user.email,
        "name": user.name,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(seconds=settings.auth_jwt_ttl_seconds)).timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    settings = get_settings()
    return jwt.decode(token, settings.jwt_secret, algorithms=[JWT_ALGORITHM])


_UNAUTHORIZED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Not authenticated",
    headers={"WWW-Authenticate": "Bearer"},
)


def current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
    session: Session = Depends(get_session),
) -> User:
    if credentials is None or not credentials.credentials:
        raise _UNAUTHORIZED
    try:
        payload = decode_token(credentials.credentials)
    except jwt.PyJWTError as exc:  # expired, bad signature, malformed, …
        raise _UNAUTHORIZED from exc

    user_id = payload.get("sub")
    if not user_id:
        raise _UNAUTHORIZED

    user = session.get(User, user_id)
    if user is None:
        raise _UNAUTHORIZED
    return user
