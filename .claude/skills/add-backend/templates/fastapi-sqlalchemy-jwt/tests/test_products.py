"""Products contract tests — json-server dialect (CONTRACT §1, §4.2-4.4)."""

from __future__ import annotations

from tests.conftest import make_product


def test_create_then_list_with_total_count(client):
    created = client.post("/products", json=make_product(name="Alpha"))
    assert created.status_code == 201, created.text
    row = created.json()
    assert row["id"]
    assert row["name"] == "Alpha"
    assert row["createdAt"] and row["updatedAt"]

    res = client.get("/products?_page=1&_limit=10")
    assert res.status_code == 200, res.text
    rows = res.json()
    assert isinstance(rows, list)
    assert len(rows) == 1
    assert rows[0]["id"] == row["id"]
    assert res.headers["X-Total-Count"] == "1"


def test_create_validation_400(client):
    # Missing required fields / bad status → 422 (FastAPI validation).
    res = client.post("/products", json={"name": ""})
    assert res.status_code == 422
    res = client.post("/products", json=make_product(status="bogus"))
    assert res.status_code == 422
    res = client.post("/products", json=make_product(price=-1))
    assert res.status_code == 422


def test_search_q(client):
    client.post("/products", json=make_product(name="Red Widget", sku="R-1"))
    client.post("/products", json=make_product(name="Blue Gadget", sku="B-1"))

    res = client.get("/products", params={"q": "widget"})
    rows = res.json()
    assert len(rows) == 1
    assert rows[0]["name"] == "Red Widget"
    assert res.headers["X-Total-Count"] == "1"

    # Search matches sku too (case-insensitive).
    res = client.get("/products", params={"q": "b-1"})
    assert len(res.json()) == 1
    assert res.json()[0]["sku"] == "B-1"


def test_filter_status(client):
    client.post("/products", json=make_product(name="A", status="available"))
    client.post("/products", json=make_product(name="B", status="out_of_stock"))
    client.post("/products", json=make_product(name="C", status="discontinued"))

    res = client.get("/products", params={"status": "out_of_stock"})
    rows = res.json()
    assert len(rows) == 1
    assert rows[0]["name"] == "B"
    assert res.headers["X-Total-Count"] == "1"


def test_sort_order(client):
    client.post("/products", json=make_product(name="A", price=30))
    client.post("/products", json=make_product(name="B", price=10))
    client.post("/products", json=make_product(name="C", price=20))

    res = client.get("/products", params={"_sort": "price", "_order": "asc"})
    prices = [r["price"] for r in res.json()]
    assert prices == [10, 20, 30]

    res = client.get("/products", params={"_sort": "price", "_order": "desc"})
    prices = [r["price"] for r in res.json()]
    assert prices == [30, 20, 10]


def test_unknown_sort_field_falls_back_to_default(client):
    # createdAt desc default → newest first. Insert in order A, B, C.
    for name in ("A", "B", "C"):
        client.post("/products", json=make_product(name=name))

    res = client.get("/products", params={"_sort": "evil; DROP TABLE products"})
    names = [r["name"] for r in res.json()]
    # Default sort is createdAt desc → last-inserted first.
    assert names == ["C", "B", "A"]


def test_pagination(client):
    for i in range(25):
        client.post("/products", json=make_product(name=f"P{i:02d}", sku=f"S{i:02d}"))

    res = client.get("/products", params={"_page": 1, "_limit": 10})
    assert len(res.json()) == 10
    assert res.headers["X-Total-Count"] == "25"

    res = client.get("/products", params={"_page": 3, "_limit": 10})
    assert len(res.json()) == 5
    assert res.headers["X-Total-Count"] == "25"


def test_patch_then_get_reflects_change(client):
    created = client.post("/products", json=make_product(name="Before", stock=1)).json()
    pid = created["id"]

    patched = client.patch(f"/products/{pid}", json={"name": "After", "stock": 99})
    assert patched.status_code == 200, patched.text
    assert patched.json()["name"] == "After"
    assert patched.json()["stock"] == 99

    fetched = client.get(f"/products/{pid}")
    assert fetched.status_code == 200
    assert fetched.json()["name"] == "After"
    assert fetched.json()["stock"] == 99


def test_patch_unknown_404(client):
    res = client.patch("/products/does-not-exist", json={"name": "X"})
    assert res.status_code == 404


def test_delete_then_get_404(client):
    created = client.post("/products", json=make_product()).json()
    pid = created["id"]

    res = client.delete(f"/products/{pid}")
    assert res.status_code == 204

    assert client.get(f"/products/{pid}").status_code == 404
    # Delete again → 404.
    assert client.delete(f"/products/{pid}").status_code == 404


def test_get_unknown_404(client):
    assert client.get("/products/nope").status_code == 404


def test_cors_exposes_total_count_header(client):
    # The CORS middleware must expose X-Total-Count to browsers.
    res = client.get(
        "/products",
        headers={"Origin": "http://localhost:3000"},
    )
    expose = res.headers.get("access-control-expose-headers", "")
    assert "X-Total-Count" in expose
