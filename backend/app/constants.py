"""
Application-wide constants and enums. Single source of truth — the
frontend's constants/index.ts mirrors these values 1:1.
"""
import enum


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    STAFF = "STAFF"


class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class ProductBadge(str, enum.Enum):
    NONE = "NONE"
    BESTSELLER = "BESTSELLER"
    NEW = "NEW"
    FAVOURITE = "FAVOURITE"
    STUDIO_PICK = "STUDIO_PICK"


DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

LOW_STOCK_THRESHOLD_DEFAULT = 5
