from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.constants import ProductBadge
from app.core.database import Base


class Product(Base):
    """A single sellable product, always attached to one category. Each
    product renders its own detail page on the storefront (by slug)."""
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id", ondelete="CASCADE"), index=True, nullable=False)

    name: Mapped[str] = mapped_column(String(160), nullable=False)
    slug: Mapped[str] = mapped_column(String(180), unique=True, index=True, nullable=False)
    short_description: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    description: Mapped[str] = mapped_column(Text, nullable=True, default="")

    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    old_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=True)

    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    image_url: Mapped[str] = mapped_column(String(500), nullable=True, default="")  # served from /uploads
    image_color: Mapped[str] = mapped_column(String(16), nullable=False, default="#22304F")  # fallback accent color
    badge: Mapped[ProductBadge] = mapped_column(Enum(ProductBadge), default=ProductBadge.NONE, nullable=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    category: Mapped["Category"] = relationship(back_populates="products")
