from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field

from app.schemas.common import ORMBase


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=128)
    description: Optional[str] = ""
    icon: str = Field(default="Shirt", max_length=64, description="Lucide icon name, e.g. 'PartyPopper'")
    image_url: Optional[str] = Field(default="", max_length=500)
    display_order: int = 0
    parent_id: Optional[int] = None  # if set, this is a subcategory


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=128)
    description: Optional[str] = None
    icon: Optional[str] = Field(default=None, max_length=64)
    image_url: Optional[str] = Field(default=None, max_length=500)
    display_order: Optional[int] = None
    parent_id: Optional[int] = None


class CategoryOut(ORMBase):
    id: int
    name: str
    slug: str
    description: Optional[str]
    icon: str
    image_url: Optional[str]
    display_order: int
    parent_id: Optional[int]
    created_at: datetime
    updated_at: datetime


class CategoryWithSubcategoriesOut(CategoryOut):
    subcategories: List[CategoryOut] = []


class CategoryWithCountOut(CategoryOut):
    product_count: int
    subcategories: List[CategoryOut] = []
