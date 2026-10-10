

from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.constants import AuthProvider, UserRole
from app.core.database import Base


class User(Base):
    """Admins/staff run the store; customers sign up on the storefront
    (email + password or Google) to track orders and save favourites."""
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(128), unique=True, index=True, nullable=False)
    # Null for Google-only accounts.
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=True)
    full_name: Mapped[str] = mapped_column(String(128), nullable=False, default="")
    phone: Mapped[str] = mapped_column(String(32), nullable=True, default=None)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.CUSTOMER, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    auth_provider: Mapped[AuthProvider] = mapped_column(
        Enum(AuthProvider), default=AuthProvider.LOCAL, nullable=False
    )
    google_id: Mapped[str] = mapped_column(String(128), unique=True, index=True, nullable=True)
    profile_image: Mapped[str] = mapped_column(String(512), nullable=True)
    last_login: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    @property
    def has_password(self) -> bool:
        return bool(self.hashed_password)
