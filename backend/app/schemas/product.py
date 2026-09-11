from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field

from app.constants import ProductBadge
from app.schemas.category import CategoryOut
from app.schemas.common import ORMBase


class ProductCreate(BaseModel):
    category_id: int
    name: str = Field(min_length=1, max_length=160)
    short_description: str = Field(default="", max_length=255)
    description: Optional[str] = ""
    price: Decimal = Field(gt=0)
    old_price: Optional[Decimal] = Field(default=None, gt=0)
    stock: int = Field(default=0, ge=0)
    image_color: str = Field(default="#22304F", max_length=16)
    badge: ProductBadge = ProductBadge.NONE
    is_featured: bool = False
    is_active: bool = True


class ProductUpdate(BaseModel):
    category_id: Optional[int] = None
    name: Optional[str] = Field(default=None, max_length=160)
    short_description: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(default=None, gt=0)
    old_price: Optional[Decimal] = Field(default=None, gt=0)
    stock: Optional[int] = Field(default=None, ge=0)
    image_color: Optional[str] = Field(default=None, max_length=16)
    badge: Optional[ProductBadge] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None


class ProductOut(ORMBase):
    id: int
    category_id: int
    name: str
    slug: str
    short_description: str
    description: Optional[str]
    price: Decimal
    old_price: Optional[Decimal]
    stock: int
    image_url: Optional[str]
    image_color: str
    badge: ProductBadge
    is_featured: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime


class ProductDetailOut(ProductOut):
    category: CategoryOut
