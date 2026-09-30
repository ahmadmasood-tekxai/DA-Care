from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.product import Product

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Category(Base):
    """A product category (e.g. 'Wedding Sets', 'Birthday Sets'). Each
    category can hold many products — admin can add new categories anytime.
    A category with parent_id set is a sub-category of the parent."""
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    parent_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=True, index=True, default=None
    )
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True, default="")
    icon: Mapped[str] = mapped_column(String(64), nullable=False, default="Shirt")  # lucide icon name
    image_url: Mapped[str] = mapped_column(String(500), nullable=True, default="")
    display_order: Mapped[int] = mapped_column(default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Self-referential: parent ↔ subcategories
    parent: Mapped["Category"] = relationship(
        "Category",
        back_populates="subcategories",
        remote_side="Category.id",
        primaryjoin="Category.parent_id == Category.id",
        foreign_keys="[Category.parent_id]",
        uselist=False,
    )
    subcategories: Mapped[list["Category"]] = relationship(
        "Category",
        back_populates="parent",
        cascade="all, delete-orphan",
        primaryjoin="Category.parent_id == Category.id",
        foreign_keys="[Category.parent_id]",
    )

    products: Mapped[list["Product"]] = relationship(
        "Product",
        back_populates="category",
        cascade="all, delete-orphan",
        foreign_keys="[Product.category_id]",
    )
