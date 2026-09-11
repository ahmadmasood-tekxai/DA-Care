from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.constants import OrderStatus
from app.core.database import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderCreate, OrderOut, OrderStatusUpdate

router = APIRouter(prefix="/orders", tags=["Orders"])


def _to_order_out(order: Order) -> OrderOut:
    total = sum((Decimal(item.unit_price) * item.quantity for item in order.items), Decimal("0"))
    return OrderOut(
        id=order.id, customer_name=order.customer_name, customer_phone=order.customer_phone,
        customer_address=order.customer_address, status=order.status, note=order.note,
        created_at=order.created_at, updated_at=order.updated_at,
        items=[
            {
                "id": i.id, "product_id": i.product_id, "product_name_snapshot": i.product_name_snapshot,
                "unit_price": i.unit_price, "quantity": i.quantity,
            }
            for i in order.items
        ],
        total_amount=total,
    )


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    """
    Public — used by the storefront's cart checkout. Also usable by the
    admin to manually log a WhatsApp order. Unit prices are snapshotted
    from the product's current price at order time.
    """
    order = Order(
        customer_name=payload.customer_name, customer_phone=payload.customer_phone,
        customer_address=payload.customer_address or "", note=payload.note or "",
    )
    db.add(order)
    db.flush()

    for line in payload.items:
        product = db.query(Product).filter(Product.id == line.product_id).first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product id {line.product_id} not found")
        db.add(
            OrderItem(
                order_id=order.id, product_id=product.id, product_name_snapshot=product.name,
                unit_price=product.price, quantity=line.quantity,
            )
        )

    db.commit()
    db.refresh(order)
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order.id).first()
    return _to_order_out(order)


@router.get("", response_model=List[OrderOut])
def list_orders(
    status_filter: Optional[OrderStatus] = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Order).options(joinedload(Order.items))
    if status_filter:
        query = query.filter(Order.status == status_filter)
    orders = query.order_by(Order.created_at.desc()).all()
    return [_to_order_out(o) for o in orders]


@router.patch("/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return _to_order_out(order)
