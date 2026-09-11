from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.common import ORMBase


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=128)
    description: Optional[str] = ""
    icon: str = Field(default="Shirt", max_length=64, description="Lucide icon name, e.g. 'PartyPopper'")
    display_order: int = 0


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=128)
    description: Optional[str] = None
    icon: Optional[str] = Field(default=None, max_length=64)
    display_order: Optional[int] = None


class CategoryOut(ORMBase):
    id: int
    name: str
    slug: str
    description: Optional[str]
    icon: str
    display_order: int
    created_at: datetime
    updated_at: datetime


class CategoryWithCountOut(CategoryOut):
    product_count: int
