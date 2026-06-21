"""Custom JWT auth primitives (CONTRACT §2a).

- Passwords hashed with Argon2 via ``pwdlib`` — never stored or compared in
  plaintext. Argon2id is the modern, memory-hard default (OWASP-recommended);
  ``pwdlib`` is actively maintained, unlike the now-unmaintained ``passlib``
  (whose bcrypt backend additionally logs a spurious ``AttributeError`` traceback
  against bcrypt 4.x).
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
from pwdlib import PasswordHash
from pwdlib.exceptions import UnknownHashError
from pwdlib.hashers.argon2 import Argon2Hasher
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import get_session
from app.models import User

JWT_ALGORITHM = "HS256"

# Argon2id hasher (pwdlib). Unlike bcrypt, Argon2 has no 72-byte input limit, so
# long passwords are hashed in full rather than silently truncated.
_password_hash = PasswordHash((Argon2Hasher(),))

# A precomputed Argon2 hash of a throwaway password. Login verifies against this
# when the email is unknown so the work done (and thus response timing) does not
# reveal whether an account exists — see ``verify_password_dummy`` below.
_DUMMY_HASH = _password_hash.hash("a-password-that-is-never-valid")

# auto_error=False so we can raise our own 401 with a consistent body.
_bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return _password_hash.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    # A malformed/unidentifiable stored hash is a failed match, not a 500.
    try:
        return _password_hash.verify(password, password_hash)
    except (UnknownHashError, ValueError, TypeError):
        return False


def verify_password_dummy() -> None:
    """Run a password verification against a constant dummy hash.

    Called on the no-such-user login path so the request spends roughly the same
    time as a real verify, defeating timing-based user enumeration (CONTRACT §2a).
    """
    _password_hash.verify("a-password-that-is-never-valid-either", _DUMMY_HASH)


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


_DATA_UNAUTHORIZED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Unauthorized",
    headers={"WWW-Authenticate": "Bearer"},
)


def require_data_token(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> None:
    """Optional bearer guard for the DATA routes (CONTRACT §1).

    When ``DATA_API_TOKEN`` is unset the data API trusts its network and this is a
    no-op (zero-config dev keeps working). When set, every data request must carry
    ``Authorization: Bearer <DATA_API_TOKEN>`` — a missing or mismatched token is
    rejected with 401 ``{"detail": "Unauthorized"}``. This gates only the data
    routes; the auth routes have their own auth and are never gated by this.
    """
    expected = get_settings().data_token
    if expected is None:
        return
    if credentials is None or credentials.credentials != expected:
        raise _DATA_UNAUTHORIZED
