"""Products routes — json-server dialect (CONTRACT §1).

GET /products supports ``_page`` / ``_limit`` / ``_sort`` / ``_order`` / ``q`` /
``status`` and sets ``X-Total-Count`` (the filtered, not paginated, count). Sort
and filter honor whitelists — raw user input is never used to sort/filter
(CONTRACT §0). The default sort is ``createdAt`` descending.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.orm import Session

from app.db import get_session
from app.models import Product
from app.schemas import ProductInput, ProductOut, ProductPatch

router = APIRouter(prefix="/products", tags=["products"])

# Whitelists mirror the frontend; never sort/filter by raw input (CONTRACT §0).
SEARCHABLE = (Product.name, Product.sku, Product.category)
SORTABLE = {
    "name": Product.name,
    "category": Product.category,
    "price": Product.price,
    "stock": Product.stock,
    "createdAt": Product.created_at,
}
DEFAULT_SORT_COLUMN = Product.created_at  # createdAt desc


@router.get("", response_model=list[ProductOut])
@router.get("/", response_model=list[ProductOut], include_in_schema=False)
def list_products(
    response: Response,
    session: Session = Depends(get_session),
    _page: int = Query(default=1, ge=1),
    _limit: int = Query(default=10, ge=1, le=100),
    _sort: str | None = None,
    _order: str | None = None,
    q: str | None = None,
    status: str | None = None,
) -> list[Product]:
    stmt = select(Product)

    # Search (case-insensitive OR across the searchable whitelist).
    if q:
        term = f"%{q.lower()}%"
        stmt = stmt.where(or_(*[func.lower(col).like(term) for col in SEARCHABLE]))

    # Exact-match filter on the whitelisted `status` column. A value outside the
    # enum is still applied as an exact match (it simply yields no rows), which is
    # the honest semantics — we never widen the filter to arbitrary columns.
    if status:
        stmt = stmt.where(Product.status == status)

    # Count of the FILTERED (not paginated) set for X-Total-Count.
    total = session.scalar(
        select(func.count()).select_from(stmt.order_by(None).subquery())
    )

    # Sort: whitelist only; unknown/absent field → default sort (createdAt desc).
    if _sort in SORTABLE:
        sort_column = SORTABLE[_sort]
        # Explicit field: asc unless _order=desc.
        direction = desc if (_order or "").lower() == "desc" else asc
    else:
        sort_column = DEFAULT_SORT_COLUMN
        # Default key createdAt is desc unless _order=asc is explicitly requested.
        direction = asc if (_order or "").lower() == "asc" else desc
    # Stable tiebreaker on id for deterministic pagination.
    stmt = stmt.order_by(direction(sort_column), asc(Product.id))

    # Pagination.
    stmt = stmt.offset((_page - 1) * _limit).limit(_limit)
    rows = list(session.scalars(stmt).all())

    response.headers["X-Total-Count"] = str(total or 0)
    return rows


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: str, session: Session = Depends(get_session)) -> Product:
    product = session.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return product


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
@router.post(
    "/", response_model=ProductOut, status_code=status.HTTP_201_CREATED, include_in_schema=False
)
def create_product(
    body: ProductInput, session: Session = Depends(get_session)
) -> Product:
    product = Product(**body.model_dump())
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


@router.patch("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: str, body: ProductPatch, session: Session = Depends(get_session)
) -> Product:
    product = session.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    changes = body.model_dump(exclude_unset=True)
    for key, value in changes.items():
        setattr(product, key, value)
    session.commit()
    session.refresh(product)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: str, session: Session = Depends(get_session)) -> Response:
    product = session.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    session.delete(product)
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
