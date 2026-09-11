from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field

from app.constants import OrderStatus
from app.schemas.common import ORMBase


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=1, max_length=128)
    customer_phone: str = Field(default="", max_length=32)
    customer_address: Optional[str] = Field(default="", max_length=255)
    note: Optional[str] = Field(default="", max_length=255)
    items: List[OrderItemCreate] = Field(min_length=1)


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderItemOut(ORMBase):
    id: int
    product_id: Optional[int]
    product_name_snapshot: str
    unit_price: Decimal
    quantity: int

    @property
    def line_total(self) -> Decimal:
        return self.unit_price * self.quantity


class OrderOut(ORMBase):
    id: int
    customer_name: str
    customer_phone: str
    customer_address: Optional[str]
    status: OrderStatus
    note: Optional[str]
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemOut] = []
    total_amount: Decimal
