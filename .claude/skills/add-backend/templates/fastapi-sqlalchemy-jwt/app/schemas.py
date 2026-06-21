"""Pydantic v2 schemas — request validation + response serialization.

Field names and the JSON shape mirror the frontend's ``src/features/products``
and the auth contract exactly (CONTRACT §0, §2a). Timestamps serialize as
ISO-8601 UTC strings; the resource uses camelCase ``createdAt`` / ``updatedAt``
on the wire.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal

from pydantic import (
    AliasChoices,
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_serializer,
)

ProductStatus = Literal["available", "out_of_stock", "discontinued"]


# --- Products ---------------------------------------------------------------


class ProductInput(BaseModel):
    """Create body (CONTRACT §0). Rejects unknown fields; description optional."""

    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1)
    sku: str = Field(min_length=1)
    category: str = Field(min_length=1)
    price: float = Field(ge=0)
    stock: int = Field(ge=0)
    status: ProductStatus
    description: str = ""


class ProductPatch(BaseModel):
    """Partial update body. Every field optional; unknown fields rejected."""

    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, min_length=1)
    sku: str | None = Field(default=None, min_length=1)
    category: str | None = Field(default=None, min_length=1)
    price: float | None = Field(default=None, ge=0)
    stock: int | None = Field(default=None, ge=0)
    status: ProductStatus | None = None
    description: str | None = None


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    name: str
    sku: str
    category: str
    price: float
    stock: int
    status: ProductStatus
    description: str
    createdAt: datetime = Field(
        validation_alias=AliasChoices("created_at", "createdAt")
    )
    updatedAt: datetime = Field(
        validation_alias=AliasChoices("updated_at", "updatedAt")
    )

    @field_serializer("createdAt", "updatedAt")
    def _ser_dt(self, value: datetime) -> str:
        # Timestamps are stored UTC. SQLite drops tzinfo, so attach UTC when naive
        # and emit a "+00:00"-suffixed ISO-8601 string (CONTRACT §0: ISO-8601, UTC).
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc).isoformat()


# --- Auth -------------------------------------------------------------------


class RegisterInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str = Field(min_length=1)
    name: str = Field(min_length=1)


class LoginInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str = Field(min_length=1)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    name: str


class AuthResponse(BaseModel):
    token: str
    user: UserOut
