from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.constants import OrderStatus, PaymentMethod, PaymentStatus
from app.core.database import Base


class Order(Base):
    """
    A customer order placed through the storefront.
    Supports both Cash-on-Delivery and Manual Bank Transfer payment flows.
    Total is always derived from its line items — never entered manually.
    """
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    customer_name: Mapped[str] = mapped_column(String(128), nullable=False)
    customer_phone: Mapped[str] = mapped_column(String(32), nullable=False, default="")
    customer_address: Mapped[str] = mapped_column(String(255), nullable=True, default="")
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    note: Mapped[str] = mapped_column(String(255), nullable=True, default="")
    created_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)

    # Payment fields
    payment_method: Mapped[PaymentMethod] = mapped_column(
        Enum(PaymentMethod), default=PaymentMethod.CASH_ON_DELIVERY, nullable=False
    )
    payment_status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus), default=PaymentStatus.UNPAID, nullable=False
    )
    transaction_ref: Mapped[str] = mapped_column(String(255), nullable=True, default=None)
    receipt_image_url: Mapped[str] = mapped_column(String(500), nullable=True, default=None)
    rejection_reason: Mapped[str] = mapped_column(String(500), nullable=True, default=None)
    transferred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True, default=None)
    confirmed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True, default=None)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    items: Mapped[list["OrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    """One product line within an order. unit_price is snapshotted at
    order time so historical revenue stays accurate even if the product's
    price changes later."""
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True, nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True)
    product_name_snapshot: Mapped[str] = mapped_column(String(160), nullable=False)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    order: Mapped["Order"] = relationship(back_populates="items")
