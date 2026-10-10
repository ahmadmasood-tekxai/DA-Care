"""
Application-wide constants and enums. Single source of truth — the
frontend's constants/index.ts mirrors these values 1:1.
"""
import enum

from app.core.config import settings


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    STAFF = "STAFF"
    CUSTOMER = "CUSTOMER"


# Roles allowed into the admin panel. Customers sign up on the storefront and
# must never reach catalogue/order management endpoints.
STAFF_ROLES = frozenset({UserRole.ADMIN, UserRole.STAFF})


class AuthProvider(str, enum.Enum):
    LOCAL = "LOCAL"
    GOOGLE = "GOOGLE"


class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class PaymentMethod(str, enum.Enum):
    CASH_ON_DELIVERY = "CASH_ON_DELIVERY"
    BANK_TRANSFER = "BANK_TRANSFER"


class PaymentStatus(str, enum.Enum):
    UNPAID = "UNPAID"
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
    PAID = "PAID"


class ProductBadge(str, enum.Enum):
    NONE = "NONE"
    BESTSELLER = "BESTSELLER"
    NEW = "NEW"
    FAVOURITE = "FAVOURITE"
    STUDIO_PICK = "STUDIO_PICK"


DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

LOW_STOCK_THRESHOLD_DEFAULT = 5

# ---------------------------------------------------------------------------
# Bank Details — single source of truth lives in .env (see core/config.py).
# ---------------------------------------------------------------------------
BANK_ACCOUNT_TITLE = settings.BANK_ACCOUNT_TITLE
BANK_NAME = settings.BANK_NAME
BANK_ACCOUNT_NUMBER = settings.BANK_ACCOUNT_NUMBER
BANK_IBAN = settings.BANK_IBAN
