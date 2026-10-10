from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.constants import OrderStatus, PaymentMethod, PaymentStatus
from app.schemas.common import ORMBase


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=1, max_length=128)
    customer_phone: str = Field(default="", max_length=32)
    # Optional for guests; when present the customer gets a confirmation and
    # an email at every status change.
    customer_email: Optional[EmailStr] = None
    customer_address: Optional[str] = Field(default="", max_length=255)
    note: Optional[str] = Field(default="", max_length=255)
    items: List[OrderItemCreate] = Field(min_length=1)
    payment_method: PaymentMethod = PaymentMethod.CASH_ON_DELIVERY

    @field_validator("customer_email", mode="before")
    @classmethod
    def blank_email_is_none(cls, v):
        if isinstance(v, str):
            v = v.strip().lower()
            return v or None
        return v


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class BankTransferConfirm(BaseModel):
    """Payload sent when the customer clicks 'I've Made the Transfer'."""
    transaction_ref: Optional[str] = Field(default=None, max_length=255)


class PaymentVerificationAction(BaseModel):
    """Admin action: confirm or reject a pending bank transfer."""
    action: str = Field(..., pattern="^(confirm|reject)$")
    rejection_reason: Optional[str] = Field(default=None, max_length=500)


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
    customer_email: Optional[str] = None
    customer_address: Optional[str]
    status: OrderStatus
    note: Optional[str]
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    transaction_ref: Optional[str]
    receipt_image_url: Optional[str]
    rejection_reason: Optional[str]
    transferred_at: Optional[datetime]
    confirmed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemOut] = []
    total_amount: Decimal
    created_by_id: Optional[int] = None


class BankDetailsOut(BaseModel):
    """Public bank details returned to the storefront at checkout."""
    account_title: str
    bank_name: str
    account_number: str
    iban: str
