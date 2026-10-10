"""
Shared storefront query helpers so every product listing endpoint searches
and sorts the same way.
"""
from typing import Optional

from sqlalchemy import or_
from sqlalchemy.orm import Query

from app.models.product import Product

SORT_PATTERN = "^(newest|price_asc|price_desc|name|discount)$"

_ORDER_BY = {
    "newest": Product.created_at.desc(),
    "price_asc": Product.price.asc(),
    "price_desc": Product.price.desc(),
    "name": Product.name.asc(),
    # Biggest percentage saving first; products without an old price go last.
    "discount": ((Product.old_price - Product.price) / Product.old_price).desc().nullslast(),
}


def apply_search(query: Query, search: Optional[str]) -> Query:
    if not search or not search.strip():
        return query
    like = f"%{search.strip()}%"
    return query.filter(or_(Product.name.ilike(like), Product.short_description.ilike(like)))


def apply_sort(query: Query, sort: str) -> Query:
    # Secondary key keeps pagination stable when the primary values tie.
    return query.order_by(_ORDER_BY.get(sort, _ORDER_BY["newest"]), Product.id.desc())
