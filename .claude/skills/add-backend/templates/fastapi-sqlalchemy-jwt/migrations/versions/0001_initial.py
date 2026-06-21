"""initial users and products tables

Creates the two tables the app needs — ``users`` (auth) and ``products`` (the
canonical sample resource) — with the indexes that mirror the list-query
whitelists (CONTRACT §0). This is the production schema entrypoint; run it with
``alembic upgrade head``. (The zero-config SQLite dev path may instead rely on
``init_db()`` / ``create_all`` — see the README "Migrations" section.)

Revision ID: 0001_initial
Revises:
Create Date: 2026-06-21
"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "products",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("sku", sa.String(length=255), nullable=False),
        sa.Column("category", sa.String(length=255), nullable=False),
        sa.Column("price", sa.Float(), nullable=False),
        sa.Column("stock", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("products", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_products_category"), ["category"], unique=False)
        batch_op.create_index(batch_op.f("ix_products_created_at"), ["created_at"], unique=False)
        batch_op.create_index(batch_op.f("ix_products_name"), ["name"], unique=False)
        batch_op.create_index(batch_op.f("ix_products_price"), ["price"], unique=False)
        batch_op.create_index(batch_op.f("ix_products_sku"), ["sku"], unique=False)
        batch_op.create_index(batch_op.f("ix_products_status"), ["status"], unique=False)
        batch_op.create_index(batch_op.f("ix_products_stock"), ["stock"], unique=False)

    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_users_email"), ["email"], unique=True)


def downgrade() -> None:
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_users_email"))
    op.drop_table("users")

    with op.batch_alter_table("products", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_products_stock"))
        batch_op.drop_index(batch_op.f("ix_products_status"))
        batch_op.drop_index(batch_op.f("ix_products_sku"))
        batch_op.drop_index(batch_op.f("ix_products_price"))
        batch_op.drop_index(batch_op.f("ix_products_name"))
        batch_op.drop_index(batch_op.f("ix_products_created_at"))
        batch_op.drop_index(batch_op.f("ix_products_category"))
    op.drop_table("products")
