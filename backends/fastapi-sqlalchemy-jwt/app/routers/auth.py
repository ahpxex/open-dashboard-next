"""Auth routes — custom JWT shape (CONTRACT §2a).

POST /auth/register · POST /auth/login · GET /auth/me · POST /auth/logout.
register/login return ``{ token, user }``; the frontend stores the token in its
own session cookie and validates it via GET /auth/me on every guarded load.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import (
    create_token,
    current_user,
    hash_password,
    verify_password,
    verify_password_dummy,
)
from app.db import get_session
from app.models import User
from app.schemas import AuthResponse, LoginInput, RegisterInput, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED
)
def register(body: RegisterInput, session: Session = Depends(get_session)) -> AuthResponse:
    email = body.email.lower()
    existing = session.scalar(select(User).where(User.email == email))
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Email already registered"
        )

    user = User(email=email, name=body.name, password_hash=hash_password(body.password))
    session.add(user)
    session.commit()
    session.refresh(user)

    return AuthResponse(token=create_token(user), user=UserOut.model_validate(user))


@router.post("/login", response_model=AuthResponse)
def login(body: LoginInput, session: Session = Depends(get_session)) -> AuthResponse:
    email = body.email.lower()
    user = session.scalar(select(User).where(User.email == email))
    if user is None:
        # Run a dummy verify so the no-such-user path costs roughly the same as a
        # real one — timing must not reveal whether the account exists.
        verify_password_dummy()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )
    if not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    return AuthResponse(token=create_token(user), user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(current_user)) -> UserOut:
    return UserOut.model_validate(user)


@router.post("/logout")
def logout() -> dict:
    # Stateless JWTs: nothing to revoke server-side. The frontend clears its cookie.
    return {"ok": True}
