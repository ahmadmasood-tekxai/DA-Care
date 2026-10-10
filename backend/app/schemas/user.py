from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.constants import AuthProvider, UserRole
from app.schemas.common import ORMBase


class UserCreate(BaseModel):
    """Public sign-up. The role is never taken from the request — every
    storefront registration is a CUSTOMER (staff are created by an admin)."""
    username: Optional[str] = Field(default=None, min_length=3, max_length=64)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(default="", max_length=128)
    phone: Optional[str] = Field(default=None, max_length=32)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class StaffCreate(BaseModel):
    """Admin-only: create another admin/staff account."""
    username: str = Field(min_length=3, max_length=64)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(default="", max_length=128)
    role: UserRole = UserRole.STAFF

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class UserOut(ORMBase):
    id: int
    username: str
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: UserRole
    is_active: bool
    auth_provider: AuthProvider = AuthProvider.LOCAL
    has_password: bool = True
    profile_image: Optional[str] = None
    last_login: Optional[datetime] = None
    created_at: datetime


class AdminUserOut(UserOut):
    """User row for the admin Users screen, with purchase stats."""
    orders_count: int = 0
    total_spent: Decimal = Decimal("0")
    last_order_at: Optional[datetime] = None


class UserUpdateMe(BaseModel):
    full_name: Optional[str] = Field(default=None, max_length=128)
    phone: Optional[str] = Field(default=None, max_length=32)
    current_password: Optional[str] = Field(default=None, max_length=128)
    new_password: Optional[str] = Field(default=None, min_length=8, max_length=128)


class AdminUserUpdate(BaseModel):
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None


class LoginRequest(BaseModel):
    # Accepts either the username or the email address.
    username: str
    password: str


class GoogleVerifyRequest(BaseModel):
    id_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut
