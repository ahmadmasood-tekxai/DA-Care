from decimal import Decimal

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from app.api.deps import require_staff
from app.constants import OrderStatus, PaymentStatus, UserRole
from app.core.database import get_db
from app.models.category import Category
from app.models.order import Order
from app.models.product import Product
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


class TopProduct(BaseModel):
    product_name: str
    units_sold: int
    revenue: Decimal


class DashboardSummary(BaseModel):
    total_revenue: Decimal
    total_orders: int
    pending_orders: int
    total_products: int
    total_categories: int
    low_stock_products: int
    total_customers: int
    payments_to_verify: int
    top_products: list[TopProduct]


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db), current_user: User = Depends(require_staff)):
    orders = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.status != OrderStatus.CANCELLED)
        .all()
    )

    total_revenue = Decimal("0")
    product_stats: dict[str, dict] = {}

    for order in orders:
        for item in order.items:
            line_total = Decimal(item.unit_price) * item.quantity
            total_revenue += line_total
            stats = product_stats.setdefault(item.product_name_snapshot, {"units_sold": 0, "revenue": Decimal("0")})
            stats["units_sold"] += item.quantity
            stats["revenue"] += line_total

    top_products = sorted(
        [TopProduct(product_name=name, **data) for name, data in product_stats.items()],
        key=lambda p: p.revenue,
        reverse=True,
    )[:5]

    pending_orders = db.query(Order).filter(Order.status == OrderStatus.PENDING).count()
    total_products = db.query(Product).count()
    total_categories = db.query(Category).count()
    low_stock_products = db.query(Product).filter(Product.stock <= 5, Product.is_active.is_(True)).count()
    total_customers = db.query(User).filter(User.role == UserRole.CUSTOMER).count()
    payments_to_verify = db.query(Order).filter(Order.payment_status == PaymentStatus.PENDING_VERIFICATION).count()

    return DashboardSummary(
        total_revenue=total_revenue,
        total_orders=len(orders),
        pending_orders=pending_orders,
        total_products=total_products,
        total_categories=total_categories,
        low_stock_products=low_stock_products,
        total_customers=total_customers,
        payments_to_verify=payments_to_verify,
        top_products=top_products,
    )
