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
# Bank Details — Single source of truth. Change here to update everywhere.
# ---------------------------------------------------------------------------
BANK_ACCOUNT_TITLE = "Muhammad Ahmad"
BANK_NAME = "Mashriq Bank"
BANK_ACCOUNT_NUMBER = "089010046367"
BANK_IBAN = "PK45MSHQ0000089010046367"
